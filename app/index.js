const Papa = require("papaparse");
const bwipjs = require("bwip-js");
const { readFile, outputFile, remove } = require("fs-extra");

const FILE_PATH = "../print.csv";
const EAN_ARRAY = [];
const SKU_ARRAY = [];

const dataLoader = async () => {
  try {
    const file = await readFile(FILE_PATH, "utf8");
    const parsedFile = await Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (result) => {
        return result;
      },
    });
    for (const obj of parsedFile.data) {
      for (let i = 0; i < obj.length; i++) {
        i === 0 ? SKU_ARRAY.push(obj[i]) : EAN_ARRAY.push(obj[i]);
      }
    }
  } catch (e) {
    console.log(
      "Wystąpił błąd podczas odczytu pliku, SPRAWDZ CZY ZAPISAŁES PLIK JAKO .CSV (MS-DOS)"
    );
  }
  await remove("../print");
};

(async () => {
  try {
    await dataLoader();
    const counter = {
      sku: 1,
      ean: 1,
    };
    for (const sku of SKU_ARRAY) {
      const barcode = await bwipjs.toBuffer({
        bcid: "code128", // Barcode type
        text: sku || "puste pole", // Text to encode
        scale: 3, // 3x scaling factor
        height: 10, // Bar height, in millimeters
        includetext: true, // Show human-readable text
        textxalign: "center", // Always good to set this
      });
      await outputFile(`../print/sku/${counter.sku++}.jpg`, barcode);
    }
    for (const ean of EAN_ARRAY) {
      const barcode = await bwipjs.toBuffer({
        bcid: "code128", // Barcode type
        backgroundcolor: "#fcfcfc",
        text: ean || "puste pole", // Text to encode
        scale: 3, // 3x scaling factor
        height: 10, // Bar height, in millimeters
        includetext: true, // Show human-readable text
        textxalign: "center", // Always good to set this
      });
      await outputFile(`../barcodes/ean/${counter.ean++}.jpg`, barcode);
    }
  } catch (e) {
    console.log(`Wystąpił błąd: ${e}`);
  }
})();
