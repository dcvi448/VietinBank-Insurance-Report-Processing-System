import React, { useState, useEffect } from "react";
import XLSX from "xlsx";

let sheetExcel = null;

export const resetSheetExcel = (mustReset) => {
  sheetExcel = mustReset ? null : sheetExcel;
};

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
  const worksheet = sheetExcel === null ?
    (await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)): sheetExcel;
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
  clearSheetExcelGlobal = false
) => {
  const worksheet = sheetExcel === null ?
    (await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)): sheetExcel;
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

  return sum;
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

  const worksheet = sheetExcel === null ?
    (await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)): sheetExcel;

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
  const worksheet = sheetExcel === null ?
    (await getWorksheet(excelUrl, sheetIndex, clearSheetExcelGlobal)): sheetExcel;

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

  const columnValues = filteredRows.map(
    (row) => row[functionAppliedColumnIndex]
  );
  const functionResult = applyExcelFunction(columnValues, functionExcel);

  const worksheetToInsert = await getWorksheet(
    excelUrl,
    sheetIndexToInsert,
    clearSheetExcelGlobal
  );

  const cell = worksheetToInsert[cellToInsert];
  cell.v = functionResult;
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
