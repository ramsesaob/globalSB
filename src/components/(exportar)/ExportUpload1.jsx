import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportUpload1 = ({ data, uComens, sucursalMap, c2Value }) => {
  
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }
  
    // Configurar el tipo de archivo y nombre
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileName = `txt-${uComens}-Nº2.xlsx`;
  
    // Crear la hoja de datos con encabezados
    const ws_data = [
      ['ParentKey', 'LineNum', 'ItemCode', 'ItemDescription', 'Quantity', 'ShipDate', 'Price', 'PriceAfterVAT', 'Currency', 'Rate', 'DiscountPercent', 'VendorNum', 'SerialNum', 'WarehouseCode', 'SalesPersonCode', 'CommisionPercent', 'TreeType', 'AccountCode', 'UseBaseUnits', 'SupplierCatNum', 'CostingCode', 'ProjectCode', 'BarCode', 'VatGroup', 'Height1', 'Hight1Unit', 'Height2', 'Height2Unit', 'Lengh1', 'Lengh1Unit', 'Lengh2', 'Lengh2Unit', 'Weight1', 'Weight1Unit', 'Weight2', 'Weight2Unit', 'Factor1', 'Factor2', 'Factor3', 'Factor4', 'BaseType', 'BaseEntry', 'BaseLine', 'Volume', 'VolumeUnit', 'Width1', 'Width1Unit', 'Width2', 'Width2Unit', 'Address', 'TaxCode', 'TaxType', 'TaxLiable', 'BackOrder', 'FreeText', 'ShippingMethod', 'CorrectionInvoiceItem', 'CorrInvAmountToStock', 'CorrInvAmountToDiffAcct', 'WTLiable', 'DeferredTax', 'MeasureUnit', 'UnitsOfMeasurment', 'LineTotal', 'TaxPercentagePerRow', 'TaxTotal', 'ConsumerSalesForecast', 'ExciseAmount', 'CountryOrg', 'SWW', 'TransactionType', 'DistributeExpense', 'ShipToCode', 'RowTotalFC', 'CFOPCode', 'CSTCode', 'Usage', 'TaxOnly', 'UnitPrice', 'LineStatus', 'LineType', 'COGSCostingCode', 'COGSAccountCode', 'ChangeAssemlyBoMWarehouse', 'GrossBuyPrice', 'GrossBase', 'GrossProfitTotalBasePrice', 'CostingCode2', 'CostingCode3', 'CostingCode4', 'CostingCode5', 'ItemDetails', 'LocationCode', 'ActualDeliveryDate', 'ExLineNo', 'RequiredDate', 'RequiredQuantity', 'COGSCostingCode2', 'COGSCostingCode3', 'COGSCostingCode4', 'COGSCostingCode5', 'WithoutInventoryMovement', 'AgrementNo', 'AgreementRowNumber', 'ShipToDescription', 'U_COMENS'],
      ['DocNum', 'LineNum', 'ItemCode', 'Dscription', 'Quantity', 'ShipDate', 'Price', 'PriceAfVAT', 'Currency', 'Rate', 'DiscPrcnt', 'VendorNum', 'SerialNum', 'WhsCode', 'SlpCode', 'Commission', 'TreeType', 'AcctCode', 'UseBaseUn', 'SubCatNum', 'OcrCode', 'Project', 'CodeBars', 'VatGroup', 'Height1', 'Hght1Unit', 'Height2', 'Hght2Unit', 'Length1', 'Len1Unit', 'length2', 'Len2Unit', 'Weight1', 'Wght1Unit', 'Weight2', 'Wght2Unit', 'Factor1', 'Factor2', 'Factor3', 'Factor4', 'BaseType', 'BaseEntry', 'BaseLine', 'Volume', 'VolUnit', 'Width1', 'Wdth1Unit', 'Width2', 'Wdth2Unit', 'Address', 'TaxCode', 'TaxType', 'TaxStatus', 'BackOrdr', 'FreeTxt', 'TrnsCode', 'CEECFlag', 'ToStock', 'ToDiff', 'WtLiable', 'DeferrTax', 'unitMsr', 'NumPerMsr', 'LineTotal', 'VatPrcnt', 'VatSum', 'ConsumeFCT', 'ExciseAmt', 'CountryOrg', 'SWW', 'TranType', 'DistribExp', 'ShipToCode', 'TotalFrgn', 'CFOPCode', 'CSTCode', 'Usage', 'TaxOnly', 'PriceBefDi', 'LineStatus', 'LineType', 'CogsOcrCod', 'CogsAcct', 'ChgAsmBoMW', 'GrossBuyPr', 'GrossBase', 'GPTtlBasPr', 'OcrCode2', 'OcrCode3', 'OcrCode4', 'OcrCode5', 'Text', 'LocCode', 'ActDelDate', 'ExLineNo', 'PQTReqDate', 'PQTReqQty', 'CogsOcrCo2', 'CogsOcrCo3', 'CogsOcrCo4', 'CogsOcrCo5', 'NoInvtryMv', 'AgrNo', 'AgrLnNum', 'ShipToDesc', 'Comentarios']
    ];
  
    // Agregar los datos debajo de los encabezados
    data.forEach((row) => {
      // Depurar los datos
      //console.log('Fila de datos:', row);
  
      // Obtener numero_id de sucursalMap
      const sucursalId = sucursalMap.get(row.sucursal) ? sucursalMap.get(row.sucursal).numero_id : 'Sin ID';

    //  console.log('Sucursal:', row.sucursal);
    //  console.log('Sucursal Map:', sucursalMap);
    //  console.log('Número ID:', sucursalId);
      
  
      ws_data.push([
        sucursalId, // ParentKey / DocNum
        '', // LineNum
        row.codigo, // ItemCode
        '', // ItemDescription / Dscription
        row.cantidad, // Quantity
        '', // ShipDate
        '', // Price
        '', // PriceAfterVAT / PriceAfVAT
        'USD', // Currency
        '', // Rate
        '', // DiscountPercent / DiscPrcnt
        '', // VendorNum
        '', // SerialNum
        c2Value, // WarehouseCode / WhsCode
        '', // SalesPersonCode / SlpCode
        '', // CommisionPercent / Commission
        '', // TreeType
        '', // AccountCode / AcctCode
        '', // UseBaseUnits / UseBaseUn
        '', // SupplierCatNum / SubCatNum
        '', // CostingCode / OcrCode
        '', // ProjectCode / Project
        '', // BarCode / CodeBars
        '', // VatGroup
        '', // Height1
        '', // Hight1Unit / Hght1Unit
        '', // Height2
        '', // Height2Unit / Hght2Unit
        '', // Lengh1 / Length1
        '', // Lengh1Unit / Len1Unit
        '', // Lengh2 / length2
        '', // Lengh2Unit / Len2Unit
        '', // Weight1
        '', // Weight1Unit / Wght1Unit
        '', // Weight2
        '', // Weight2Unit / Wght2Unit
        '', // Factor1
        '', // Factor2
        '', // Factor3
        '', // Factor4
        '', // BaseType
        '', // BaseEntry
        '', // BaseLine
        '', // Volume
        '', // VolumeUnit / VolUnit
        '', // Width1
        '', // Width1Unit / Wdth1Unit
        '', // Width2
        '', // Width2Unit / Wdth2Unit
        '', // Address
        '', // TaxCode
        '', // TaxType
        '', // TaxLiable / TaxStatus
        '', // BackOrder / BackOrdr
        `BTO_${row.pcsXbulto}`, // FreeText / FreeTxt
        '', // ShippingMethod / TrnsCode
        '', // CorrectionInvoiceItem / CEECFlag
        '', // CorrInvAmountToStock / ToStock
        '', // CorrInvAmountToDiffAcct / ToDiff
        '', // WTLiable / WtLiable
        '', // DeferredTax / DeferrTax
        '', // MeasureUnit / unitMsr
        '', // UnitsOfMeasurment / NumPerMsr
        '', // LineTotal / LineTotal
        '', // TaxPercentagePerRow / VatPrcnt
        '', // TaxTotal / VatSum
        '', // ConsumerSalesForecast / ConsumeFCT
        '', // ExciseAmount / ExciseAmt
        '', // CountryOrg
        '', // SWW
        '', // TransactionType / TranType
        '', // DistributeExpense / DistribExp
        '', // ShipToCode
        '', // RowTotalFC / TotalFrgn
        '', // CFOPCode
        '', // CSTCode
        '', // Usage
        '', // TaxOnly
        '', // UnitPrice / PriceBefDi
        '', // LineStatus
        '', // LineType
        '', // COGSCostingCode / CogsOcrCod
        '', // COGSAccountCode / CogsAcct
        '', // ChangeAssemlyBoMWarehouse / ChgAsmBoMW
        '', // GrossBuyPrice / GrossBuyPr
        '', // GrossBase / GrossBase
        '', // GrossProfitTotalBasePrice / GPTtlBasPr
        '', // CostingCode2 / OcrCode2
        '', // CostingCode3 / OcrCode3
        '', // CostingCode4 / OcrCode4
        '', // CostingCode5 / OcrCode5
        '', // ItemDetails / Text
        '', // LocationCode / LocCode
        '', // ActualDeliveryDate / ActDelDate
        '', // ExLineNo
        '', // RequiredDate / PQTReqDate
        '', // RequiredQuantity / PQTReqQty
        '', // COGSCostingCode2 / CogsOcrCo2
        '', // COGSCostingCode3 / CogsOcrCo3
        '', // COGSCostingCode4 / CogsOcrCo4
        '', // COGSCostingCode5 / CogsOcrCo5
        '', // WithoutInventoryMovement / NoInvtryMv
        '', // AgrementNo / AgrNo
        '', // AgreementRowNumber / AgrLnNum
        '', // ShipToDescription / ShipToDesc
        `${uComens}`// U_COMENS
      ]);
    });
  
    // Crear y descargar el archivo Excel
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button className="btn btn-success mx-2" onClick={exportToExcel}>
    <i className='bx bxs-file-txt bx-md'></i> 2
  </button>
  );
};

export default ExportUpload1;
