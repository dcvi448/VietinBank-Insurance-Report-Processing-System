import React, { useState, useEffect } from "react";
import XLSX from "xlsx";

import ReactFileReader from "react-file-reader";

let sheetExcel = null;

export const resetSheetExcel = (mustReset) => {
  sheetExcel = mustReset ? null : sheetExcel;
};

function roundToMillion(number) {
  return Math.round(number / 1000000);
}

const getWorksheet = async (
  excelUrl,
  sheetIndex = 0,
  clearSheetExcelGlobal = true
) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(excelUrl);
  await new Promise((resolve) => {
    reader.onload = () => {
      resolve();
    };
  });
  const data = reader.result;
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[sheetIndex];
  sheetExcel = clearSheetExcelGlobal ? workbook.Sheets[sheetName] : sheetExcel;
  return sheetExcel;
};



export const getNonDuplicateValues = async (
  excelUrl,
  columnId = "STT",
  sheetIndex = 0,
  clearSheetExcelGlobal = false
) => {
  const worksheet =
    sheetExcel === null
      ? await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)
      : sheetExcel;
  const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const adColumnIndex = parsedData[0].indexOf(columnId);
  const adColumnValues = parsedData.slice(1).map((row) => row[adColumnIndex]);
  const nonDuplicateAdColumnValues = [...new Set(adColumnValues)];
  return nonDuplicateAdColumnValues;
};

export const filterAndSum = async (
  excelUrl,
  columnsMustFilter,
  valuesColumnsMustFilter,
  sumColumn,
  sheetIndex = 0,
  clearSheetExcelGlobal = false, rndRoundToMillion= true
) => {
  const worksheet =
    sheetExcel === null
      ? await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)
      : sheetExcel;
  const conditions = columnsMustFilter.map((col, index) => ({
    column: XLSX.utils.decode_col(col),
    value: valuesColumnsMustFilter[index],
  }));

  let filteredRows = XLSX.utils
    .sheet_to_json(worksheet, { header: 1 })
    .slice(1);
  conditions.forEach(({ column, value }) => {
    filteredRows = filteredRows.filter((row) => row[column] === value);
  });

  const sumColumnIndex = XLSX.utils.decode_col(sumColumn);
  const sum = filteredRows.reduce(
    (total, row) => total + row[sumColumnIndex],
    0
  );

  return rndRoundToMillion?roundToMillion(sum):sum;
};

export const insertSumToCell = async (
  excelUrl,
  columnsMustFilter,
  valuesColumnsMustFilter,
  sumColumn,
  sheetIndexToInsert,
  cellToInsert,
  sheetIndex = 0,
  clearSheetExcelGlobal = false
) => {
  const sum = await filterAndSum(
    excelUrl,
    columnsMustFilter,
    valuesColumnsMustFilter,
    sumColumn,
    sheetIndex,
    clearSheetExcelGlobal
  );

  const worksheet =
    sheetExcel === null
      ? await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)
      : sheetExcel;

  const cell = worksheet[cellToInsert];
  cell.v = sum;
};

const applyExcelFunction = (values, functionExcel) => {
  const functionString = `${functionExcel}(${values.join(",")})`;
  const result = XLSX.calculateFunction(functionString);
  return result;
};

export const applyExcelFunctionToColumnAndInsertResult = async (
  excelUrl,
  columnsMustFilter,
  valuesColumnsMustFilter,
  sheetIndex = 0,
  functionExcel,
  functionAppliedColumn,
  sheetIndexToInsert,
  cellToInsert,
  clearSheetExcelGlobal = false
) => {
  const worksheet =
    sheetExcel === null
      ? await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)
      : sheetExcel;

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  const filterColumnsIndexes = columnsMustFilter.map((col) =>
    XLSX.utils.decode_col(col)
  );
  const functionAppliedColumnIndex = XLSX.utils.decode_col(
    functionAppliedColumn
  );

  let filteredRows = XLSX.utils
    .sheet_to_json(worksheet, { header: 1, range })
    .slice(1);
  filterColumnsIndexes.forEach((colIndex, i) => {
    filteredRows = filteredRows.filter(
      (row) => row[colIndex] === valuesColumnsMustFilter[i]
    );
  });
};

export const filterRow = async (
  excelUrl,
  columnsMustFilter,
  valuesColumnsMustFilter,
  getColumnIndex,
  sheetIndex = 0,
  clearSheetExcelGlobal = false
) => {
  const worksheet =
    sheetExcel === null
      ? await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)
      : sheetExcel;
  const conditions = columnsMustFilter.map((col, index) => ({
    column: XLSX.utils.decode_col(col),
    value: valuesColumnsMustFilter[index],
  }));

  let filteredRows = XLSX.utils
    .sheet_to_json(worksheet, { header: 1 })
    .slice(1);
  conditions.forEach(({ column, value }) => {
    filteredRows = filteredRows.filter((row) => row[column] === value);
  });
  const result = filteredRows.map((e) => {
    return e[XLSX.utils.decode_col(getColumnIndex)];
  });

  const nonDuplicateFilteredColumnValues = [...new Set(result)];
  return nonDuplicateFilteredColumnValues;
};

export const saveExcelFile = async (workbook, filename) => {
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

export const addDataToExcelFile = async (
  data,
  sheetName,
  startRow = 0,
  fileName
) => {
  try {
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet([]);
    
    let rowIndex = startRow;
    while (newWorksheet["A" + rowIndex]) {
      rowIndex++;
    }
    XLSX.utils.sheet_add_aoa(
      newWorksheet,
      data,
      { origin: -1, dateNF: "dd/mm/yyyy" },
      rowIndex
    );
    
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
    const workbookArray = XLSX.write(newWorkbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([workbookArray], { type: "application/octet-stream" });
    return URL.createObjectURL(blob);
  
  } catch (error) {
    console.error(error);
    return "";
  }
};


export const insertArrayToSheetJS = async (
  arr,
  sheetName,
  startRow = 0,
  templateFilePath
) => {
  const res = await fetch(templateFilePath);
  const data = await res.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet);
  json.splice(startRow, 0, ...arr);
  const ws = XLSX.utils.json_to_sheet(json);
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  const binaryData = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  const url = URL.createObjectURL(
    new Blob([s2ab(binaryData)], { type: "application/octet-stream" })
  );
  return url;
};
