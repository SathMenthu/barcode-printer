const Papa = require("papaparse");
const bwipjs = require("bwip-js");
const { readFile, outputFile, remove } = require("fs-extra");
const readline = require("readline");

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
  await remove("../barcodes");
};

const printData = async () => {
  try {
    const counter = {
      sku: 1001,
      ean: 1001,
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
      await outputFile(`../barcodes/sku/${counter.sku++}.jpg`, barcode);
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
    return counter;
  } catch (e) {
    console.log(e);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  try {
    let currentLanguage = "PL";
    const language = {
      PL: {
        WARRNING:
          "Make sure you removed the headers and saved the file as print.csv (in Excel, save as > .csv (ms-dos)",
        QUESTION: "Generate Codes (press enter): ",
        FINAL:
          "Generation Complete! Your files are in the barcodes folder! (press enter to exit) ",
        CONTACT: "If it occured an error, please dm to @Mateusz Krasik",
        REMOVING: "Trying to remove barcodes folder ...",
        GENERATE: "Generating barcodes ...",
      },
      ENG: {
        WARRNING:
          "Upewnij się, że usunąłeś nagłówki i zapisałeś plik jako print.csv (w excelu opcja zapisz jako > .csv (ms-dos)",
        QUESTION: "Wygeneruj kody (naciśnij enter): ",
        FINAL:
          "Generowanie zakończone, twoje pliki znajdują się w folderze barcodes! (naciśnij enter, żeby wyjść) ",
        CONTACT: "Jeżeli wystąpił jakiś błąd, pisz do @Mateusz Krasik",
        REMOVING: "Próba usunięcia folderu barcodes ...",
        GENERATE: "Generowanie barcode'ów ...",
      },
    };

    let question = "";
    await rl.question(
      "Hello!, Choose your language (PL/ENG): ",
      async (answer) => {
        answer === "ENG" || "eng"
          ? (currentLanguage = "ENG")
          : (currentLanguage = "PL");
        console.log(language[currentLanguage].WARRNING);
        console.log(language[currentLanguage].CONTACT);
        await rl.question(language[currentLanguage].QUESTION, async () => {
          console.log(language[currentLanguage].REMOVING);
          await dataLoader();
          console.log(language[currentLanguage].GENERATE);
          await printData();
          rl.question(language[currentLanguage].FINAL, async () => {
            rl.close();
          });
        });
      }
    );
  } catch (e) {
    console.log(`Wystąpił błąd: ${e}`);
  }
})();
