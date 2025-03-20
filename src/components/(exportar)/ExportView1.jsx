import React, { useContext, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { carritoContext } from "../../contexts/carritoContext";
import { ar } from 'date-fns/locale';
const ExportView1 = ({ ordenPedido}) => {
  const { datosUsuario,apiBaseUrl } = useContext(carritoContext);
  const [articulos, setArticulos] = useState([]);
  const [loadingArticulos, setLoadingArticulos] = useState(true);
  useEffect(() => {
    const fetchAllArticulos = async () => {
      setLoadingArticulos(true); // Iniciar carga
      const allArticulos = [];
      if (ordenPedido && ordenPedido.orden_items) {
        for (const item of ordenPedido.orden_items) {
          const codigo = item.articulo.codigo;
          try {
            const response = await fetch(`${apiBaseUrl}/art/contenedor.json?codigo=${codigo}`);
            const result = await response.json();
            
            if (result.articulos) {
              allArticulos.push(result.articulos);
            }
          } catch (error) {
            console.error(`Error fetching artículo ${codigo}:`, error);
          }
        }
        setArticulos(allArticulos);
      }
      setLoadingArticulos(false); // Finalizar carga
    };
  
    if (ordenPedido) {
      fetchAllArticulos();
    }
  }, [ordenPedido]);

 
  
  const exportToExcel = () => {
    if (loadingArticulos) {
      return <div className="text-center">Cargando artículos...</div>; // Mensaje de carga
    }
   
    if (!ordenPedido) {
      console.error('No hay datos para exportar.');
      return;
    }
   

  
  
 
  
  //console.log(articulos);

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileName = `OrdenPedido_txt2_${ordenPedido.numero_ped}.xlsx`;

    const ws_data = [
      // Headers
      ['ParentKey', 'LineNum', 'ItemCode', 'ItemDescription', 'Quantity', 'ShipDate', 'Price', 'PriceAfterVAT', 'Currency', 'Rate', 'DiscountPercent', 'VendorNum', 'SerialNum', 'WarehouseCode', 'SalesPersonCode', 'CommisionPercent', 'TreeType', 'AccountCode', 'UseBaseUnits', 'SupplierCatNum', 'CostingCode', 'ProjectCode', 'BarCode', 'VatGroup', 'Height1', 'Hight1Unit', 'Height2', 'Height2Unit', 'Lengh1', 'Lengh1Unit', 'Lengh2', 'Lengh2Unit', 'Weight1', 'Weight1Unit', 'Weight2', 'Weight2Unit', 'Factor1', 'Factor2', 'Factor3', 'Factor4', 'BaseType', 'BaseEntry', 'BaseLine', 'Volume', 'VolumeUnit', 'Width1', 'Width1Unit', 'Width2', 'Width2Unit', 'Address', 'TaxCode', 'TaxType', 'TaxLiable', 'BackOrder', 'FreeText', 'ShippingMethod', 'CorrectionInvoiceItem', 'CorrInvAmountToStock', 'CorrInvAmountToDiffAcct', 'WTLiable', 'DeferredTax', 'MeasureUnit', 'UnitsOfMeasurment', 'LineTotal', 'TaxPercentagePerRow', 'TaxTotal', 'ConsumerSalesForecast', 'ExciseAmount', 'CountryOrg', 'SWW', 'TransactionType', 'DistributeExpense', 'ShipToCode', 'RowTotalFC', 'CFOPCode', 'CSTCode', 'Usage', 'TaxOnly', 'UnitPrice', 'LineStatus', 'LineType', 'COGSCostingCode', 'COGSAccountCode', 'ChangeAssemlyBoMWarehouse', 'GrossBuyPrice', 'GrossBase', 'GrossProfitTotalBasePrice', 'CostingCode2', 'CostingCode3', 'CostingCode4', 'CostingCode5', 'ItemDetails', 'LocationCode', 'ActualDeliveryDate', 'ExLineNo', 'RequiredDate', 'RequiredQuantity', 'COGSCostingCode2', 'COGSCostingCode3', 'COGSCostingCode4', 'COGSCostingCode5', 'WithoutInventoryMovement', 'AgrementNo', 'AgreementRowNumber', 'ShipToDescription', 'U_COMENS'],
      // Subheaders
      ['DocNum', 'LineNum', 'ItemCode', 'Dscription', 'Quantity', 'ShipDate', 'Price', 'PriceAfVAT', 'Currency', 'Rate', 'DiscPrcnt', 'VendorNum', 'SerialNum', 'WhsCode', 'SlpCode', 'Commission', 'TreeType', 'AcctCode', 'UseBaseUn', 'SubCatNum', 'OcrCode', 'Project', 'CodeBars', 'VatGroup', 'Height1', 'Hght1Unit', 'Height2', 'Hght2Unit', 'Length1', 'Len1Unit', 'length2', 'Len2Unit', 'Weight1', 'Wght1Unit', 'Weight2', 'Wght2Unit', 'Factor1', 'Factor2', 'Factor3', 'Factor4', 'BaseType', 'BaseEntry', 'BaseLine', 'Volume', 'VolUnit', 'Width1', 'Wdth1Unit', 'Width2', 'Wdth2Unit', 'Address', 'TaxCode', 'TaxType', 'TaxStatus', 'BackOrdr', 'FreeTxt', 'TrnsCode', 'CEECFlag', 'ToStock', 'ToDiff', 'WtLiable', 'DeferrTax', 'unitMsr', 'NumPerMsr', 'LineTotal', 'VatPrcnt', 'VatSum', 'ConsumeFCT', 'ExciseAmt', 'CountryOrg', 'SWW', 'TranType', 'DistribExp', 'ShipToCode', 'TotalFrgn', 'CFOPCode', 'CSTCode', 'Usage', 'TaxOnly', 'PriceBefDi', 'LineStatus', 'LineType', 'CogsOcrCod', 'CogsAcct', 'ChgAsmBoMW', 'GrossBuyPr', 'GrossBase', 'GPTtlBasPr', 'OcrCode2', 'OcrCode3', 'OcrCode4', 'OcrCode5', 'Text', 'LocCode', 'ActDelDate', 'ExLineNo', 'PQTReqDate', 'PQTReqQty', 'CogsOcrCo2', 'CogsOcrCo3', 'CogsOcrCo4', 'CogsOcrCo5', 'NoInvtryMv', 'AgrNo', 'AgrLnNum', 'ShipToDesc', 'Comentarios']
    ];

    const filteredItems = ordenPedido.orden_items.filter(item => item.validado == '1' && item.cantidad_val > 0 && item.traslado == 1);

    filteredItems.forEach((item) => {
      // Buscar el artículo correspondiente para obtener NumAtCard
      const articulo = articulos.find(a => a.Codigo === item.articulo.codigo); // Asegúrate de que 'Codigo' es el nombre correcto de la propiedad
      console.log(articulo);
      ws_data.push([
        ordenPedido.numero_ped, // ParentKey / DocNum
        '',        // LineNum
        item.articulo.codigo, // ItemCode
        '', // ItemDescription / Dscription
        item.cantidad_val,    // Quantity
        '', // ShipDate
        '', // Price
        '', // PriceAfterVAT / PriceAfVAT
        'USD', // Currency
        '', // Rate
        '', // DiscountPercent / DiscPrcnt
        '', // VendorNum
        '', // SerialNum
        'MB02', // WarehouseCode / WhsCode
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
        item.articulo.unidad_compra, // FreeText / FreeTxt
        '', // ShippingMethod / TrnsCode
        '', // CorrectionInvoiceItem / CEECFlag
        '', // CorrInvAmountToStock / ToStock
        '', // CorrInvAmountToDiffAcct / ToDiff
        '', // WTLiable / WtLiable
        '', // DeferredTax / DeferrTax
        '', // MeasureUnit / unitMsr
        '', // UnitsOfMeasurment / NumPerMsr
        '', // LineTotal
        '', // TaxPercentagePerRow / VatPrcnt
        '', // TaxTotal
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
        '', // GrossBase
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
        articulo ? articulo.NumAtCard : '', // U_COMENS / Comentarios
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!freeze'] = { xSplit: 0, ySplit: 2 };

    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, fileName);
  };

  return (
    <>
    {articulos.length > 0 ? (
      <button className="btn btn-success mx-2" onClick={exportToExcel}>
        <i className='bx bxs-file-txt bx-md'></i> 2
      </button>
    ) : (
      <button className="btn btn-success mx-2" disabled>
         <i className='bx bxs-file-txt bx-md'></i> 2
         </button>
     
    )}
  </>
  );
}

export default ExportView1;
