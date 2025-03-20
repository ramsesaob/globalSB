import React, { useState, useEffect, useContext } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns'; // Asegúrate de tener date-fns instalado
import { carritoContext } from '../../contexts/carritoContext';


// Mapeo de códigos de sucursal
const sucursalMap = {
  'V05': 'V5',
  'V03': 'V3',
  'VLN': 'VLN',
  'V06': 'V6',
  'MCY': 'MCY',
  'MCY02': 'MCY2',
  'BQTO': 'BQ-C',
  'BQTOE': 'BQ-E',
  'MCB01': 'MB-1',
  'MCBO02': 'MB-2',
  'MCB03': 'MB-3',
  'C01': 'C1',
  'C02': 'C2',
  'C03': 'C3',
  'C04': 'C4',
  'C05': 'C5',
  'C06': 'C6',
  'C07': 'C7',
  'C08': 'C8',
  'C09': 'C9',
  'C10': 'C10',
  'C11': 'C11',
  'BR': 'BRN',
  'SNC': 'SNC',
  'MRG01': 'MGRT',
  'MT01': 'MTRN',
  'PFJ01': 'PF01',
  'LEC01': 'LCH',
 
};

// Normalizar códigos de sucursal
const normalizeCodigo = (codigo) => {
  const normalized = sucursalMap[codigo];
  if (!normalized) {
   // console.log(`Código no encontrado en el mapa: ${codigo}`);
  }
  return normalized || codigo;
};



const ExportUpload2 = ({ data, uComens, d2Value, c1Value, onUpdateSucursalMap, c2Value }) => {
  const [sucursales, setSucursales] = useState(new Map());
  const { apiBaseUrl } = useContext(carritoContext);
 
 
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/sucursal/index.json`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const sucursalesData = await response.json();
        
       // console.log('Datos de sucursales:', sucursalesData);
  
        // Registro de los códigos originales y sus normalizaciones
        sucursalesData.forEach(s => {
          const normalizedCodigo = normalizeCodigo(s.codigo);
        //  console.log(`Código original: ${s.codigo}, Código normalizado: ${normalizedCodigo}`);
        });
  
        const sucursalMapData = new Map(sucursalesData.map(s => [normalizeCodigo(s.codigo), s]));
       // console.log('Mapa de sucursales normalizado:', sucursalMapData);
  
        setSucursales(sucursalMapData);
        onUpdateSucursalMap(sucursalMapData);
      } catch (err) {
        console.error('Error fetching sucursales:', err);
      }
    };
  
    fetchSucursales();
  }, [onUpdateSucursalMap]);
  

  const formatDate = (date) => format(date, 'yyyyMMdd');

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }

    const headers = [
      ['DocNum', 'DocType', 'HandWritten', 'Printed', 'DocDate', 'DocDueDate', 'CardCode', 'CardName', 'Address', 'NumAtCard', 'DocCurrency', 'DocRate', 'DocTotal', 'Reference1', 'Reference2', 'Comments', 'JournalMemo', 'PaymentGroupCode', 'DocTime', 'SalesPersonCode', 'TransportationCode', 'Confirmed', 'ImportFileNum', 'SummeryType', 'ContactPersonCode', 'ShowSCN', 'Series', 'TaxDate', 'PartialSupply', 'DocObjectCode', 'ShipToCode', 'Indicator', 'FederalTaxID', 'DiscountPercent', 'PaymentReference', 'DocTotalFc', 'Form1099', 'Box1099', 'RevisionPo', 'RequriedDate', 'CancelDate', 'BlockDunning', 'Pick', 'PaymentMethod', 'PaymentBlock', 'PaymentBlockEntry', 'CentralBankIndicator', 'MaximumCashDiscount', 'Project', 'ExemptionValidityDateFrom', 'ExemptionValidityDateTo', 'WareHouseUpdateType', 'Rounding', 'ExternalCorrectedDocNum', 'InternalCorrectedDocNum', 'DeferredTax', 'TaxExemptionLetterNum', 'AgentCode', 'NumberOfInstallments', 'ApplyTaxOnFirstInstallment', 'VatDate', 'DocumentsOwner', 'FolioPrefixString', 'FolioNumber', 'DocumentSubType', 'BPChannelCode', 'BPChannelContact', 'Address2', 'PayToCode', 'ManualNumber', 'UseShpdGoodsAct', 'IsPayToBank', 'PayToBankCountry', 'PayToBankCode', 'PayToBankAccountNo', 'PayToBankBranch', 'BPL_IDAssignedToInvoice', 'DownPayment', 'ReserveInvoice', 'LanguageCode', 'TrackingNumber', 'PickRemark', 'ClosingDate', 'SequenceCode', 'SequenceSerial', 'SeriesString', 'SubSeriesString', 'SequenceModel', 'UseCorrectionVATGroup', 'DownPaymentAmount', 'DownPaymentPercentage', 'DownPaymentType', 'DownPaymentAmountSC', 'DownPaymentAmountFC', 'VatPercent', 'ServiceGrossProfitPercent', 'OpeningRemarks', 'ClosingRemarks', 'RoundingDiffAmount', 'ControlAccount', 'InsuranceOperation347', 'ArchiveNonremovableSalesQuotation'],
      ['DocNum', 'DocType', 'Handwrtten', 'Printed', 'DocDate', 'DocDueDate', 'CardCode', 'CardName', 'Address', 'NumAtCard', 'DocCur', 'DocRate', 'DocTotal', 'Ref1', 'Ref2', 'Comments', 'JrnlMemo', 'GroupNum', 'DocTime', 'SlpCode', 'TrnspCode', 'Confirmed', 'ImportEnt', 'SummryType', 'CntctCode', 'ShowSCN', 'Series', 'TaxDate', 'PartSupply', 'ObjType', 'ShipToCode', 'Indicator', 'LicTradNum', 'DiscPrcnt', 'PaymentRef', 'DocTotalFC', 'Form1099', 'Box1099', 'RevisionPo', 'ReqDate', 'CancelDate', 'BlockDunn', 'Pick', 'PeyMethod', 'PayBlock', 'PayBlckRef', 'CntrlBnk', 'MaxDscn', 'Project', 'FromDate', 'ToDate', 'UpdInvnt', 'Rounding', 'CorrExt', 'CorrInv', 'DeferrTax', 'LetterNum', 'AgentCode', 'Installmnt', 'VATFirst', 'VatDate', 'OwnerCode', 'FolioPref', 'FolioNum', 'DocSubType', 'BPChCode', 'BPChCntc', 'Address2', 'PayToCode', 'ManualNum', 'UseShpdGd', 'IsPaytoBnk', 'BnkCntry', 'BankCode', 'BnkAccount', 'BnkBranch', 'BPLId', 'DpmPrcnt', 'isIns', 'LangCode', 'TrackNo', 'PickRmrk', 'ClsDate', 'SeqCode', 'Serial', 'SeriesStr', 'SubStr', 'Model', 'UseCorrVat', 'DpmAmnt', 'DpmPrcnt', 'Posted', 'DpmAmntSC', 'DpmAmntFC', 'VatPercent', 'SrvGpPrcnt', 'Header', 'Footer', 'RoundDif', 'CtlAccount', 'InsurOp347', 'IgnRelDoc']
    ];

    const groupedData = data.reduce((acc, row) => {
      const sucursal = normalizeCodigo(row.sucursal);
      if (!acc[sucursal]) {
        acc[sucursal] = [];
      }
      acc[sucursal].push(row);
      return acc;
    }, {});

    const dataRows = Object.keys(groupedData).map(sucursal => {
      const rows = groupedData[sucursal];
      const sucursalData = sucursales.get(sucursal) || {};
      return [
        sucursalData.numero_id, // DocNum con código de sucursal
        'dDocument_Items', // DocType
        'tNO', // HandWritten
        '', // Printed
        formatDate(new Date()), // DocDate
        formatDate(new Date()), // DocDueDate
        sucursalData.cliente || '', // CardCode (Cliente)
        '', // CardName
        '', // Address
        c1Value, // NumAtCard
        'BsS', // DocCurrency
        '', // DocRate
        '', // DocTotal
        '', // Reference1
        '', // Reference2
        ` ${d2Value} WEB`, // Comments
        '', // JournalMemo
        '', // PaymentGroupCode
        '', // DocTime
        '', // SalesPersonCode
        '', // TransportationCode
        '', // Confirmed
        '', // ImportFileNum
        '', // SummeryType
        '', // ContactPersonCode
        '', // ShowSCN
        '', // Series
        '', // TaxDate
        '', // PartialSupply
        '', // DocObjectCode
        '', // ShipToCode
        '', // Indicator
        '', // FederalTaxID
        '', // DiscountPercent
        '', // PaymentReference
        '', // DocTotalFc
        '', // Form1099
        '', // Box1099
        '', // RevisionPo
        '', // RequriedDate
        '', // CancelDate
        '', // BlockDunning
        '', // Pick
        '', // PaymentMethod
        '', // PaymentBlock
        '', // PaymentBlockEntry
        '', // CentralBankIndicator
        '', // MaximumCashDiscount
        '', // Project
        '', // ExemptionValidityDateFrom
        '', // ExemptionValidityDateTo
        '', // WareHouseUpdateType
        '', // Rounding
        '', // ExternalCorrectedDocNum
        '', // InternalCorrectedDocNum
        '', // DeferredTax
        '', // TaxExemptionLetterNum
        '', // AgentCode
        '', // NumberOfInstallments
        '', // ApplyTaxOnFirstInstallment
        '', // VatDate
        '', // DocumentsOwner
        '', // FolioPrefixString
        '', // FolioNumber
        '', // DocumentSubType
        '', // BPChannelCode
        '', // BPChannelContact
        '', // Address2
        '', // PayToCode
        '', // ManualNumber
        '', // UseShpdGoodsAct
        '', // IsPayToBank
        '', // PayToBankCountry
        '', // PayToBankCode
        '', // PayToBankAccountNo
        '', // PayToBankBranch
        '1', // BPL_IDAssignedToInvoice
        '', // DownPayment
        '', // ReserveInvoice
        '', // LanguageCode
        '', // TrackingNumber
        '', // PickRemark
        '', // ClosingDate
        '', // SequenceCode
        '', // SequenceSerial
        '', // SeriesString
        '', // SubSeriesString
        '', // SequenceModel
        '', // UseCorrectionVATGroup
        '', // DownPaymentAmount
        '', // DownPaymentPercentage
        '', // DownPaymentType
        '', // DownPaymentAmountSC
        '', // DownPaymentAmountFC
        '', // VatPercent
        '', // ServiceGrossProfitPercent
        '', // OpeningRemarks
        '', // ClosingRemarks
        '', // RoundingDiffAmount
        '', // ControlAccount
        '', // InsuranceOperation347
        '' // ArchiveNonremovableSalesQuotation
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet(headers.concat(dataRows));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `txt-${uComens}-Nº1.xlsx`);
  };

  return (
    <button className="btn btn-success mx-2" onClick={exportToExcel}>
      <i className='bx bxs-file-txt bx-md'></i> 1
    </button>
  );
};

export default ExportUpload2;
