// import modules
const http = require("http");
const path = require("path");
const fs = require("fs");

// declare variables
const host = "localhost";
const port = 4001;
const itemsPath = path.join(__dirname, "items.json");

const handleResponse =
  (req, res) =>
  ({ code = 200, error = null, data = null }) => {
    res.setHeader("content-type", "application/json");
    res.writeHead(code);
    res.write(JSON.stringify({ data, error }));
    res.end();
  };

// request Handler
async function requestHandler(req, res) {
  const response = handleResponse(req, res);

  try {
    if (req.url === "/v1/items" && req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
        console.log({ body });
      });
      req.on("end", async () => {
        const newItem = JSON.parse(body);
        let itemsData = "";
        itemsData = await fs.promises.readFile(itemsPath, "utf8");
        if (!itemsData) {
          itemsData = "[]";
        }
        const items = JSON.parse(itemsData);
        const highestId = items.reduce((maxId, item) => Math.max(maxId, parseInt(item.id)), 0);
        newItem.id = highestId + 1;
        items.push(newItem);
        await fs.promises.writeFile(
          itemsPath,
          JSON.stringify(items, null, 2),
          "utf8"
        );
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newItem));
      });
    } else if (req.url === "/v1/items" && req.method === "GET") {
      const item = await fs.promises.readFile(itemsPath, "utf8");
      const items = JSON.parse(item);
      return response({ data: items, code: 200 });
    } else if (req.url.startsWith("/v1/items/") && req.method === "GET") {
      const id = Number(req.url.split("/")[3]);
    //   console.log(typeof id);
      const itemData = await fs.promises.readFile(itemsPath, "utf8");
      const items = JSON.parse(itemData);
      const item = items.find((item) => item.id === id);
      console.log(item);

      if (item) {
        return response({ data: item, code: 200 });
      } else {
        return response({ code: 404, error: "Item not found" });
      }
    } else if (req.url.startsWith("/v1/items/") && req.method === "PATCH") {
      const id = Number(req.url.split("/")[3]);
      const itemData = await fs.promises.readFile(itemsPath, "utf8");
      const parsedItem = JSON.parse(itemData);
      const itemIndex = parsedItem.findIndex((item) => item.id === id);

      if (itemIndex !== -1) {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
          console.log({ body });
        });
        req.on("end", async () => {
          const updatedItem = JSON.parse(body);
          parsedItem[itemIndex] = { ...parsedItem[itemIndex], ...updatedItem };
          await fs.promises.writeFile(
            itemsPath,
            JSON.stringify(parsedItem, null, 3),
            "utf8"
          );
          return response({ data: parsedItem[itemIndex], code: 200 });
        });
      }
    } else if (req.url.startsWith("/v1/items") && req.method === "DELETE") {
      const id = Number(req.url.split("/")[3]);
      const items = await fs.promises.readFile(itemsPath, "utf8");
      const parsedItems = JSON.parse(items);

      const itemIndex = parsedItems.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        return response({ code: 404, error: "Item not found" });
      }

      const deletedItem = parsedItems.splice(itemIndex, 1)[0];
      await fs.promises.writeFile(
        itemsPath,
        JSON.stringify(parsedItems, null, 3),
        "utf8"
      );

      return response({ data: deletedItem, code: 200 });
    } else {
      return response({ code: 404, error: "Invalid Route" });
    }
  } catch (error) {
    console.log(error);
    return response({ code: 500, error: "Internal server Error" });
  }
}

// create server
const server = http.createServer(requestHandler);
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
