var Financials = {
	Viewables: {
		Quote: {},
		AnnualBalanceSheet: {},
		AnnualCashFlow: {},
		AnnualIncome: {},
		QuarterlyBalanceSheet: {},
		QuarterlyCashFlow: {},
		QuarterlyIncome: {}
	},
	Statistics: { //last updated times
		Quote: null,
		Transactions: null,
		AnnualBalanceSheet: null,
		AnnualCashFlow: null,
		AnnualIncome: null,
		QuarterlyBalanceSheet: null,
		QuarterlyCashFlow: null,
		QuarterlyIncome: null
	},
	Template: {
		Data: {
			Symbol: null,
			Last: null,
			Previous: null,
			Change: null,
			PercentChange: null
		},
		Statement: {
			Date: null,
			Type: null,
			Fields: {},
			Id: null
		}
	},
	Flags: {
		DATA: 1,
		STATEMENT: 2
	},
	seed: function (object, newSection, iterations, flags) {
		for (var i = 0; i < iterations; i++) {
			this.set(object, newSection, JSON.parse(JSON.stringify(this.Template)), i, flags);
		};
	},
	unseed: function (object, newSection) {
		if (!newSection) return;
		if (typeof (object) == "undefined") return;
		if (typeof (object[newSection]) == "undefined") return;
		object[newSection] = {};
	},
	set: function (object, newSection, template, i, flags) {
		if (!(flags & this.Flags.DATA)) delete template.Data;
		if (!(flags & this.Flags.STATEMENT)) delete template.Statement;
		if (typeof (object) == "undefined") object = {};
		if (newSection) {
			if (typeof (object[newSection]) == "undefined") object[newSection] = {};
			object[newSection][i] = template;
		} else {
			object[i] = template;
		}
	},
	unset: function (object, newSection, i) {
		this.set(object, newSection, {}, i);
	},
	FieldMapping: {
		//Here's the convention:
		//Each statement gets its own prefix:
		//bs=BalanceSheet, cf=CashFlow, inc=Income
		//the numbers that follow: 
		//	Thousands digit is the section.
		//	Even hundred (e.g. 2400) indicates a subtotal for the section
		//	Ending in 99 indicates a total record
		//  All else are just plain records
		//On the web page the ids match except they are prefixed by "A-" or "Q-"

		bs1010: {
			textLabel: "Cash and Cash Equivalents",
			id: "Csh_Csh_Equ"
		},
		bs1020: {
			textLabel: "Restricted Cash",
			id: "Rst_Csh"
		},
		bs1030: {
			textLabel: "Short Term Investments",
			id: "Mkt_Sec"
		},
		bs1040: {
			textLabel: "Net Receivables",
			id: "Rec"
		},
		bs1050: {
			textLabel: "Inventory",
			id: "Inv"
		},
		bs1060: {
			textLabel: "Prepaid Expenses",
			id: "Ppd_Exp"
		},
		bs1070: {
			textLabel: "Deferred Income Taxes",
			id: "Cur_Def_Inc_Tax"
		},
		bs1080: {
			textLabel: "Other Current Assets",
			id: "Oth_Cur_Ass"
		},
		bs1100: {
			textLabel: "Total Current Assets",
			id: "Tot_Cur_Ass"
		},

		bs1110: {
			textLabel: "Total Cash Due From Banks",
			id: "Tot_Cash_Bnk"
		},
		bs1120: {
			textLabel: "Total Investments Banks",
			id: "Tot_Inv_Bnk"
		},
		bs1130: {
			textLabel: "Net Loans",
			id: "Net_Loans"
		},
		bs1140: {
			textLabel: "Investment In Unconsolidated Affiliates",
			id: "Inv_Uncon_Aff"
		},
		bs1150: {
			textLabel: "Customer Liability On Acceptances",
			id: "Cust_Liab_Accept"
		},
		bs1160: {
			textLabel: "Real Estate Assets",
			id: "Real_Est_Ass"
		},

		bs1210: {
			textLabel: "Investment Securities",
			id: "Inv_Sec"
		},
		bs1220: {
			textLabel: "Securities In Custody",
			id: "Sec_Cust"
		},

		bs1310: {
			textLabel: "Premium Balance Receivables",
			id: "Prem_Bal_Rec"
		},
		bs1320: {
			textLabel: "Investment In Unconsolidated Affiliates",
			id: "Inv_Uncon_Aff"
		},

		bs1510: {
			textLabel: "Long Term Investments",
			id: ""
		},
		bs1520: {
			textLabel: "Property, Plant and Equipment",
			id: "Grs_Fix_Ass"
		},
		bs1530: {
			textLabel: "Accumulated Amortization",
			id: "Acc_Depr_Depl"
		},
		bs1540: {
			textLabel: "Net Property, Plant and Equipment",
			id: "Net_Fix_Ass"
		},
		bs1550: {
			textLabel: "Total Investments And Advances",
			id: "Tot_Inv_Adv"
		},
		bs1555: {
			textLabel: "Long Term Note Receivable",
			id: "Lng_Trm_Note_Rec"
		},
		bs1560: {
			textLabel: "Goodwill",
			id: "Cost_Exc"
		},
		bs1570: {
			textLabel: "Intangible Assets",
			id: "Intang"
		},
		bs1580: {
			textLabel: "Other Non Current Assets",
			id: "Oth_Non_Cur_Ass"
		},
		bs1590: {
			textLabel: "Deferred Long Term Asset Charges",
			id: "Non_Cur_Def_Inc_Tax"
		},
		bs1600: {
			textLabel: "Total Non Current Assets",
			id: "Tot_Non_Cur_Ass"
		},

		bs1710: {
			textLabel: "Interest Receivables",
			id: "Int_Rec"
		},
		bs1720: {
			textLabel: "Deferred Tax Assets",
			id: "Def_Tax_Ass"
		},
		bs1730: {
			textLabel: "Other Intangible Assets",
			id: "Oth_Intang"
		},

		bs1999: {
			textLabel: "Total Assets",
			id: "Tot_Ass"
		},

		bs2010: {
			textLabel: "Accounts Payable",
			id: "Acc_Pay"
		},
		bs2020: {
			textLabel: "Accrued Liabilities",
			id: "Acc_Liab"
		},
		bs2030: {
			textLabel: "Deferred Revenue",
			id: "Def_Rev"
		},
		bs2040: {
			textLabel: "Short/Current Long Term Debt",
			id: "Sht_Trm_Debt"
		},
		bs2050: {
			textLabel: "Other Current Liabilities",
			id: "Oth_Cur_Liab"
		},
		bs2100: {
			textLabel: "Total Current Liabilities",
			id: "Tot_Cur_Liab"
		},

		bs2310: {
			textLabel: "Insurance Policy Liabilities Insurance",
			id: "Ins_Pol_Liab_Ins"
		},

		bs2410: {
			textLabel: "Total Deposits",
			id: "Tot_Dep"
		},
		bs2420: {
			textLabel: "Total Debt",
			id: "Tot_Debt"
		},

		bs2510: {
			textLabel: "Long Term Debt",
			id: "Lng_Trm_Debt"
		},
		bs2520: {
			textLabel: "Provision For Risks Charges",
			id: "Prov_Risk_Chg"
		},
		bs2530: {
			textLabel: "Deferred Long Term Liability Charges",
			id: "Def_Inc_Tax_Liab"
		},
		bs2540: {
			textLabel: "Other Liabilities",
			id: "Oth_Non_Cur_Liab"
		},
		bs2550: {
			textLabel: "Minority Interest",
			id: "Min_Int_Liab"
		},
		bs2600: {
			textLabel: "Total Non Current Liabilities",
			id: "Tot_Non_Cur_Liab"
		},
		bs2999: {
			textLabel: "Total Liabilities",
			id: "Tot_Liab"
		},

		bs3005: {
			textLabel: "Non Equity Reserves",
			id: "Non_Equ_Res"
		},
		bs3010: {
			textLabel: "Preferred Stock",
			id: "Prf_Stk_Equ"
		},
		bs3020: {
			textLabel: "Preferred Stock Carrying Value",
			id: "Prf_Stk_Carry_Val"
		},
		bs3030: {
			textLabel: "Common Stock",
			id: "Com_Par"
		},
		bs3040: {
			textLabel: "Retained Earnings",
			id: "Ret_Earn"
		},
		bs3050: {
			textLabel: "Treasury Stock",
			id: "Trs_Stk"
		},
		bs3060: {
			textLabel: "Capital Surplus",
			id: "Add_Paid_Cap"
		},
		bs3070: {
			textLabel: "Common Equity",
			id: "Com_Equ"
		},
		bs3080: {
			textLabel: "Other Stockholder Equity",
			id: "Oth_Equ_Adj"
		},
		bs3100: {
			textLabel: "Total Stockholder Equity",
			id: "Tot_Stk_Equ"
		},
		bs3110: {
			textLabel: "Minority Interest",
			id: "Min_Int_Equ"
		},
		bs3999: {
			textLabel: "Total Equity",
			id: "Tot_Equ"
		},

		bs4010: {
			textLabel: "Book Value Per Share",
			id: "Bk_Val_Per_Sh"
		},
		bs4020: {
			textLabel: "Tangible Book Value Per Share",
			id: "Tang_Bk_Val_Per_Sh"
		},
		bs4030: {
			textLabel: "Tier 1 Capital",
			id: "Tier1_Cap"
		},
		bs4040: {
			textLabel: "Tier 2 Capital",
			id: "Tier2_Cap"
		},

		cf0500: {
			textLabel: "Net Income",
			id: "Net_Inc"
		},
		cf1010: {
			textLabel: "Depreciation & Amortization",
			id: "Dep_Amort"
		},
		cf1012: {
			textLabel: "Depreciation",
			id: "Depreciation"
		},
		cf1015: {
			textLabel: "Amortization",
			id: "Amortization"
		},
		cf1018: {
			textLabel: "Amortization of Intangible Expenses",
			id: "Amort_Intang"
		},
		cf1020: {
			textLabel: "Adjustments To Net Income",
			id: "Adj_Net_Inc"
		},
		cf1022: {
			textLabel: "Deferred Income Taxes",
			id: "Def_Tax"
		},
		cf1025: {
			textLabel: "Other Funds",
			id: "Oth_Fds"
		},
		cf1028: {
			textLabel: "Funds From Operations",
			id: "Fds_Oper"
		},
		cf1030: {
			textLabel: "Increase Or Decrease In Receivables",
			id: "Receivables"
		},
		cf1032: {
			textLabel: "Increase Or Decrease In Payables",
			id: "Payables"
		},
		cf1035: {
			textLabel: "Changes In Accounts Receivables",
			id: "Chg_Acc_Rec"
		},
		cf1040: {
			textLabel: "Changes In Liabilities",
			id: "Chg_Liab"
		},
		cf1042: {
			textLabel: "Increase Or Decrease In Other Current Assets",
			id: "Curr_Assets"
		},
		cf1045: {
			textLabel: "Increase Or Decrease In Other Current Liabilities",
			id: "Curr_Liab"
		},
		cf1050: {
			textLabel: "Changes In Inventories",
			id: "Chg_Inventory"
		},
		cf1055: {
			textLabel: "Extraordinary Items",
			id: "ExtraOrd"
		},
		cf1060: {
			textLabel: "Changes In Other Operating Activities",
			id: "Chg_Oper_Other"
		},
		cf1062: {
			textLabel: "Other Non Cash Items",
			id: "Oth_Non_Csh"
		},
		cf1065: {
			textLabel: "Increase Or Decrease In Other Working Capital",
			id: "Working_Cap"
		},
		cf1068: {
			textLabel: "Increase Or Decrease In Prepaid Expenses",
			id: "Ppd_Exp"
		},
		cf1070: {
			textLabel: "Operating Gains Or Losses",
			id: "Oper_Gain_Loss"
		},
		cf1999: {
			textLabel: "Total Cash Flow From Operating Activities",
			id: "Operating_Total"
		},
		cf2010: {
			textLabel: "Capital Expenditures",
			id: "Cap_Exp"
		},
		cf2012: {
			textLabel: "Purchase Of Property Plant And Equipment",
			id: "Pur_Prop_Plt_Equ"
		},
		cf2015: {
			textLabel: "Sale Of Property Plant And Equipment",
			id: "Sale_Prop_Plt_Equ"
		},
		cf2018: {
			textLabel: "Aquisitions",
			id: "Aquisitions"
		},
		cf2020: {
			textLabel: "Investments",
			id: "Investments"
		},
		cf2021: {
			textLabel: "Purchase Of Long Term Investments",
			id: "Pur_LT_Inv"
		},
		cf2022: {
			textLabel: "Purchase Of Short Term Investments",
			id: "Pur_ST_Inv"
		},
		cf2023: {
			textLabel: "Purchase Of Investment Securities",
			id: "Pur_Inv_Sec"
		},
		cf2024: {
			textLabel: "Sale Of Long Term Investments",
			id: "Sale_LT_Inv"
		},
		cf2025: {
			textLabel: "Sale Of Short Term Investments",
			id: "Sale_ST_Inv"
		},
		cf2026: {
			textLabel: "Proceeds From Sale And Maturity Of Investment",
			id: "Sale_Inv_Sec"
		},
		cf2030: {
			textLabel: "Other Cash flows from Investing Activities",
			id: "Investing_Other"
		},
		cf2040: {
			textLabel: "Increase In Loans",
			id: "Inc_Loans"
		},
		cf2045: {
			textLabel: "Decrease In Loans",
			id: "Dec_Loans"
		},
		cf2050: {
			textLabel: "Federal Home Loan Advances Change",
			id: "FHL_Adv_Chg"
		},
		cf2060: {
			textLabel: "Other Uses",
			id: "Other_Uses"
		},
		cf2070: {
			textLabel: "Other Sources",
			id: "Other_Srcs"
		},
		cf2999: {
			textLabel: "Total Cash Flows From Investing Activities",
			id: "Investing_Total"
		},
		cf3010: {
			textLabel: "Dividends Paid",
			id: "Div_Paid"
		},
		cf3020: {
			textLabel: "Sale Purchase of Stock",
			id: "Sale_Pur_Stock"
		},
		cf3022: {
			textLabel: "Issuance Of Capital Stock",
			Id: "Iss_Stock"
		},
		cf3025: {
			textLabel: "Repurchase Of Capital Stock",
			id: "Repur_Stock"
		},
		cf3028: {
			textLabel: "Change In Capital Stock",
			id: "Chg_Stock"
		},
		cf3030: {
			textLabel: "Net Borrowings",
			id: "Net_Borr"
		},
		cf3032: {
			textLabel: "Issuance Of Debt",
			id: "Iss_Debt"
		},
		cf3035: {
			textLabel: "Repayment Of Debt",
			id: "Repay_Debt"
		},
		cf3038: {
			textLabel: "Issuance Or Reduction Of Debt",
			id: "Debt_Net"
		},
		cf3040: {
			textLabel: "Other Cash Flows from Financing Activities",
			id: "Financing_Other"
		},
		cf3999: {
			textLabel: "Total Cash Flows From Financing Activities",
			id: "Financing_Total"
		},
		cf4010: {
			textLabel: "Effect Of Exchange Rate Changes",
			id: "Chg_Eff_Exch_Rate"
		},
		cf4020: {
			textLabel: "Miscellaneous Funds",
			id: "Misc_Fds"
		},
		cf4099: {
			textLabel: "Change In Cash and Cash Equivalents",
			id: "Chg_Csh_Csh_Equ"
		},
		cf4110: {
			textLabel: "Free Cash Flow",
			id: "Free_Csh_Flw"
		},

		inc0100: {
			textLabel: "Total Revenue",
			id: "Rev_Total"
		},
		inc0102: {
			textLabel: "Operating Revenue",
			id: "Oper_Rev"
		},
		inc0110: {
			textLabel: "Cost of Revenue",
			id: "Cost_Sales_Depr"
		},
		inc0112: {
			textLabel: "Adjustments To Revenue",
			id: "Adj_To_Rev"
		},
		inc0115: {
			textLabel: "Cost of Sales",
			id: "Cost_Sales"
		},
		inc0998: {
			textLabel: "Gross Operating Profit",
			id: "Gross_Oper_Pft"
		},
		inc0999: {
			textLabel: "Gross Profit",
			id: "Gross_Oper_Pft_Depr"
		},
		inc1010: {
			textLabel: "Research and Development",
			id: "Rsch_Dev"
		},
		inc1020: {
			textLabel: "Selling, General and Administrative",
			id: "Sell_Gen_Adm_Exp"
		},
		inc1030: {
			textLabel: "Other",
			id: "Other_Exp"
		},
		inc1042: {
			textLabel: "Advertising",
			id: "Advert_Exp"
		},
		inc1052: {
			textLabel: "Depreciation & Amortization",
			id: "Depr_Amort"
		},
		inc1054: {
			textLabel: "Depreciation",
			id: "Depreciation"
		},
		inc1056: {
			textLabel: "Amortization",
			id: "Amortization"
		},
		inc1058: {
			textLabel: "Amortization of Intangibles",
			id: "Amort_Intang"
		},
		inc1100: {
			textLabel: "Total Operating Expenses",
			id: "Oper_Exp_Total"
		},
		inc1999: {
			textLabel: "Operating Income Or Loss",
			id: "OI"
		},
		inc2005: {
			textLabel: "Income Before Income Taxes",
			id: "Inc_Bef_Tax"
		},
		inc2010: {
			textLabel: "Operating Income",
			id: "OI"
		},
		inc2015: {
			textLabel: "Operating Income Before Depreciation",
			id: "OI_Bef_Depr"
		},
		inc2020: {
			textLabel: "Other Income",
			id: "Other_Inc_Exp"
		},
		inc2030: {
			textLabel: "Interest Expense",
			id: "Int_Exp"
		},
		inc2040: {
			textLabel: "Income Before Tax",
			id: "Pre_Tax_Inc"
		},
		inc2050: {
			textLabel: "Income Tax Expense",
			id: "Inc_Tax"
		},
		inc2060: {
			textLabel: "Minority Interest",
			id: "Min_Int"
		},
		inc2100: {
			textLabel: "Net Income From Continuing Operations",
			id: "Net_Inc_Cont_Oper"
		},
		inc2105: {
			textLabel: "Net Income From Continuing Operations",
			id: "Net_Inc_Cont_Oper_Raw"
		},
		inc3010: {
			textLabel: "Net Income From Discontinued Operations",
			id: "Net_Inc_Disc_Oper"
		},
		inc3020: {
			textLabel: "Extraordinary Income Losses",
			id: "Extra_Inc_Loss"
		},
		inc3030: {
			textLabel: "Income From Cumulated Effect Of Accounting Changes",
			id: "Inc_Cum_Eff_Acc_Chg"
		},
		inc3040: {
			textLabel: "Other Gains and Losses",
			id: "Gain_Loss_Other"
		},
		inc3998: {
			textLabel: "Total Net Income",
			id: "Net_Inc_Total"
		},
		inc3998: {
			textLabel: "Net Income From Total Operations",
			id: "Net_Inc_Oper_Total_Raw"
		},
		inc3999: {
			textLabel: "Net Income From Total Operations",
			id: "Net_Inc_Oper_Total"
		},
		inc4002: {
			textLabel: "Normalized Income",
			id: "Norm_Inc"
		},
		inc4005: {
			textLabel: "Excise Taxes",
			id: "Exc_Tax"
		},
		inc4010: {
			textLabel: "Preferred Dividends",
			id: "Pref_Div"
		},
		inc4015: {
			textLabel: "Net Interest Income Or Expense",
			id: "Net_Int_Inc_Exp"
		},
		inc4998: {
			textLabel: "Net Income Available for Common",
			id: "Net_Inc_Avail_Com_Raw"
		},
		inc4999: {
			textLabel: "Net Income Available for Common",
			id: "Net_Inc_Avail_Com"
		},

		inc0200: {
			textLabel: "Sales Or Revenue",
			id: "Sls_Rev"
		},
		inc0210: {
			textLabel: "Interest Income",
			id: "Int_Inc"
		},
		inc0220: {
			textLabel: "Cost Of Goods Sold",
			id: "Cost_Gds_Sld"
		},
		inc0230: {
			textLabel: "Losses, Claims, Reserves",
			id: "Loss_Clm_Res"
		},
		inc0299: {
			textLabel: "Gross Income",
			id: "Grs_Inc"
		},
		inc1210: {
			textLabel: "Selling, General, Administrative Expenses",
			id: "Sell_Gen_Adm_Exp"
		},
		inc1220: {
			textLabel: "Selling, General, Administrative Expenses And Other",
			id: "Sell_Gen_Adm_Exp_Oth"
		},
		inc1230: {
			textLabel: "Other Operating Expense",
			id: "Oth_Oper_Exp"
		},
		inc1240: {
			textLabel: "Total Interest Expense",
			id: "Int_Exp"
		},
		inc1250: {
			textLabel: "Total Expenses",
			id: "Tot_Exp"
		},
		inc1300: {
			textLabel: "Total Operating Expense",
			id: "Tot_Oper_Exp"
		},
		inc1399: {
			textLabel: "EBIT Operating Income",
			id: "EBIT_OI"
		},
		inc2205: {
			textLabel: "EBIT Operating Income",
			id: "EBIT_OI"
		},
		inc2210: {
			textLabel: "Net Interest Income",
			id: "Net_OI"
		},
		inc2220: {
			textLabel: "Loan Loss Provision",
			id: "LLP"
		},
		inc2230: {
			textLabel: "Net Interest Income After Loan Loss Provision",
			id: "NII_Aft_LLP"
		},
		inc2240: {
			textLabel: "Operating Income Before Interest Expense",
			id: "OI_Bef_IE"
		},
		inc2250: {
			textLabel: "Interest Expense",
			id: "IE"
		},
		inc2260: {
			textLabel: "Operating Income After Interest Expense",
			id: "OI_Aft_IE"
		},
		inc2270: {
			textLabel: "Non Interest Income",
			id: "Non_Int_Inc"
		},
		inc2280: {
			textLabel: "Non Interest Expense",
			id: "Non_Int_Exp"
		},
		inc2310: {
			textLabel: "Operating Income",
			id: "OI"
		},
		inc2320: {
			textLabel: "Non Operating Income",
			id: "Non_Oper_Inc_Exp"
		},
		inc2330: {
			textLabel: "Reserves Charge",
			id: "Res_Chg"
		},
		inc2340: {
			textLabel: "Unusual Expense",
			id: "Un_Exp"
		},
		inc2350: {
			textLabel: "Pretax Income",
			id: "Ptx_Inc"
		},
		inc2360: {
			textLabel: "Income Taxes",
			id: "Inc_Tax"
		},
		inc2370: {
			textLabel: "Equity In Earnings Of Affiliates Income",
			id: "Equ_Earn_Aff_Inc"
		},
		inc2380: {
			textLabel: "Other After Tax Adjustments",
			id: "Oth_Aft_Tax_Adj"
		},
		inc2400: {
			textLabel: "Consolidated Net Income",
			id: "Cons_New_Inc"
		},
		inc2410: {
			textLabel: "Minority Interest Expense",
			id: "Min_Int_Exp"
		},
		inc2499: {
			textLabel: "Net Income Continuing Operations",
			id: "Net_Inc_Cont_Oper"
		},
		inc3110: {
			textLabel: "Preferred Dividends",
			id: "Pref_Div"
		},
		inc3199: {
			textLabel: "Net Income Available To Common Basic",
			id: "Net_Inc_Avail_Comm_Bas"
		},
		inc3210: {
			textLabel: "EPS Diluted Before Unusual Expense",
			id: "EPS_Dil_Bef_Un_Exp"
		},
		inc3220: {
			textLabel: "EPS Basic Before Extraordinaries",
			id: "EPS_Basic_Bef_Extra"
		},
		inc3230: {
			textLabel: "EPS Fully Diluted",
			id: "EPS_Dil"
		},
		inc3240: {
			textLabel: "EBITDA",
			id: "EBITDA"
		},
		inc3250: {
			textLabel: "Ordinary Income",
			id: "Ord_Inc"
		},
		inc3260: {
			textLabel: "Stock Option Compensation Expense",
			id: "Stk_Opt_Comp_Exp"
		},
		inc3270: {
			textLabel: "Operating Lease Expense",
			id: "Oper_Lease_Exp"
		},
		inc3280: {
			textLabel: "Foreign Currency Adjustment",
			id: "Fgn_Curr_Adj"
		}
	}
};

var v = Financials.Viewables;

Financials.seed(v.Quote, null, PageLimits.quote, Financials.Flags.DATA);
Financials.seed(v.AnnualBalanceSheet, null, PageLimits.statements, Financials.Flags.STATEMENT);
Financials.seed(v.AnnualCashFlow, null, PageLimits.statements, Financials.Flags.STATEMENT);
Financials.seed(v.AnnualIncome, null, PageLimits.statements, Financials.Flags.STATEMENT);
Financials.seed(v.QuarterlyBalanceSheet, null, PageLimits.statements, Financials.Flags.STATEMENT);
Financials.seed(v.QuarterlyCashFlow, null, PageLimits.statements, Financials.Flags.STATEMENT);
Financials.seed(v.QuarterlyIncome, null, PageLimits.statements, Financials.Flags.STATEMENT);

function clearSectionData(section) {
	if (!section) return;
	if (!section.Data) {
		for (var s in section) {
			clearSectionData(section[s]);
		}
	}
	for (var d in section.Data) {
		delete section.Data[d];
	}
}

function clearSectionHeadline(section) {
	if (!section) return;
	if (!section.Headline) {
		for (var s in section) {
			clearSectionHeadline(section[s]);
		}
	}
	for (var h in section.Headline) {
		delete section.Headline[h];
	}
}

function setSectionData(section, data, reverse) {
	if (!data) return;
	var t = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Data.Symbol && (reverse || nextAvailable == null)) {
			nextAvailable = s;
		}
		if (section[s].Data.Symbol != data.Symbol) continue;
		t = section[s];
		break;
	}
	if (!t) {
		if (nextAvailable == null) return;
		t = section[nextAvailable];
	}
	for (var d in data) {
		t.Data[d] = data[d];
	}
}

function setSectionStatement(section, statement, reverse) {
	if (!statement) return;
	var st = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Statement.Date && (reverse || nextAvailable == null)) {
			nextAvailable = s;
		}
		if (!section[s].Statement.Date || section[s].Statement.Date.valueOf() != statement.Date.valueOf()) continue;
		st = section[s];
		break;
	}
	if (!st) {
		if (nextAvailable == null) return;
		st = section[nextAvailable];
	}
	for (s in statement) {
		st.Statement[s] = statement[s];
	}
}

function sortSection(section, flag) {
	var arr = [];
	for (var s in section) {
		var inserted = false;
		for (var a = 0; a < arr.length; a++) {
			if (inserted) continue;
			if (flag & Financials.Flags.DATA) {
				sortField = (section[s].Data.SortKey != null ? "SortKey" : "PercentChange");
				if (section[s].Data[sortField] > arr[a].Data[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			} else if (flag & Financials.Flags.STATEMENT) {
				sortField = (section[s].Statement.SortKey != null ? "SortKey" : "Date");
				if (section[s].Statement[sortField] > arr[a].Statement[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			}
		}
		if (!inserted) arr.push(section[s]);
	}
	var count = 0;
	for (var s in section) {
		if (arr[count]) section[s] = arr[count];
		else section[s] = null;
		count++;
	}
}

function doFilter() {}

function renderSection(container, section, aq) {
	if (symbol == "") return;
	var prices = container.getElementsByClassName("ciq-sym-price");
	if (prices.length) {
		document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "";
		document.getElementsByClassName("ciq-content")[0].style.visibility="";
		var d = section[0].Data;
		var div = prices[0].parentNode.parentNode;
		var h2 = div.getElementsByTagName("h2")[0];
		h2.children[0].innerHTML = d.Symbol;
		h2.children[1].innerHTML = d.Name;
		var p = div.getElementsByTagName("p")[0];
		if (d.Date && !isNaN(d.Date.getTime())) {
			p.innerHTML = d.Date.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(d.Date);
			if (d.Last == null || isNaN(d.Last)) prices[0].innerHTML = d.Last;
			else prices[0].innerHTML = Math.abs(d.Last).toFixed(Math.max(2, d.Last.toString().indexOf(".") == -1 ? 0 : d.Last.toString().split(".")[1].length));
			var arrow = div.getElementsByClassName("arrow")[0];
			if (d.Change == null || isNaN(d.Change)) arrow.parentNode.children[1].innerHTML = d.Change;
			else arrow.parentNode.children[1].innerHTML = Math.abs(d.Change).toFixed(d.Last < 1 || (Math.abs(d.Change) < .01 && d.PercentChange) ? 4 : 2);
			if (d.PercentChange == null || isNaN(d.PercentChange)) arrow.parentNode.children[2].innerHTML = d.PercentChange;
			else arrow.parentNode.children[2].innerHTML = Math.abs(d.PercentChange).toFixed(2) + "%";
			appendClass(arrow, d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
			if (document.getElementsByClassName("ciq-description").length)
				document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].innerHTML = d.Description;
		} else {
			prices[0].innerHTML = "N/A";
			var arrow = div.getElementsByClassName("arrow")[0];
			arrow.parentNode.children[1].innerHTML = "N/A";
			arrow.parentNode.children[2].innerHTML = "N/A";
		}
		var tbody,row;
		if(d.Holdings){
			document.getElementsByClassName("ciq-quote-feature")[0].style.visibility="";
			tbody=document.getElementById("ciq-table-fund-holdings").getElementsByTagName("tbody")[0];
			tbody.parentNode.parentNode.style.display="block";
			d.Holdings.forEach(function(value){
				row=tbody.appendChild(tbody.rows[0].cloneNode(true));
				var extraText="";
				if(value.Coupon) extraText=" [CPN:"+value.Coupon;
				if(value.MaturityDate) {
					if(extraText.length) extraText+=" ";
					else extraText=" [";
					extraText+="MAT:"+value.MaturityDate;
				}
				if(extraText.length) extraText+="]";
				row.cells[0].innerHTML=value.Name+extraText;
				row.cells[1].innerHTML=naIfNull(value.Symbol);
				row.cells[2].innerHTML=naIfNull(value.ISIN);
				row.cells[3].innerHTML=commaInt(value.NumberOfShare);
				row.cells[4].innerHTML=symbolMap[(value.Currency?value.Currency:"USD")]+commaInt(value.MarketValue);
				row.cells[5].innerHTML=parseFloat(value.Weighting).toFixed(3)+"%";
				row.style.display="";
			});
			setHeading();
		}else{
			if(isMutual(symbol)) {
				document.getElementsByClassName("ciq-quote-feature")[0].style.visibility="";
				document.getElementsByClassName("no-financials")[0].style.display="block";
			}
			isETF=false;
			setHeading();
			return;
		}
		if(d.AssetAllocation){
			tbody=document.getElementById("ciq-table-fund-allocation").getElementsByTagName("tbody")[0];
			tbody.parentNode.parentNode.style.display="block";
			for(var aa in d.AssetAllocation){
				//if(!parseFloat(d.AssetAllocation[aa].Long) && !parseFloat(d.AssetAllocation[aa].Short) && !parseFloat(d.AssetAllocation[aa].Net)) continue;
				row=tbody.appendChild(tbody.rows[0].cloneNode(true));
				row.cells[0].innerHTML=aa;
				row.cells[1].innerHTML=parseFloat(d.AssetAllocation[aa].Net).toFixed(2)+"%";
				row.cells[2].innerHTML=parseFloat(d.AssetAllocation[aa].Long).toFixed(2)+"%";
				row.cells[3].innerHTML=parseFloat(d.AssetAllocation[aa].Short).toFixed(2)+"%";
				row.style.display="";
			}
			for(var r=1;r<tbody.rows.length;r++){
				if(parseFloat(tbody.rows[r].cells[1].innerHTML)!=0) tbody.rows[r].style.fontWeight="bold";
			}
		}
		if(d.SectorWeighting){
			tbody=document.getElementById("ciq-table-fund-sector-weighting").getElementsByTagName("tbody")[0];
			tbody.parentNode.parentNode.style.display="block";
			for(var at in d.SectorWeighting){
				var rowt=tbody.appendChild(tbody.rows[0].cloneNode(true));
				rowt.cells[0].innerHTML=at;
				rowt.cells[1].innerHTML="0.000%";
				rowt.style.fontStyle="italic";
				rowt.style.display="";
				for(var sec in d.SectorWeighting[at]){
					if(sec=="Cash And Equivalents"){
						row=tbody.rows[0].cloneNode(true);
						tbody.insertBefore(row,tbody.rows[1]);
						row.cells[0].innerHTML=sec;
						row.style.fontStyle="italic";
						row.cells[1].innerHTML=parseFloat(d.SectorWeighting[at][sec]).toFixed(2)+"%";
					}else{
						row=tbody.appendChild(tbody.rows[0].cloneNode(true));
						row.cells[0].innerHTML="&nbsp;&nbsp;&nbsp;"+sec;
						row.cells[1].innerHTML=parseFloat(d.SectorWeighting[at][sec]).toFixed(2)+"%";
						rowt.cells[1].innerHTML=(parseFloat(rowt.cells[1].innerHTML)+parseFloat(row.cells[1].innerHTML)).toFixed(2)+"%";
					}
					row.style.display="";
				}
				for(var r=1;r<tbody.rows.length;r++){
					if(parseFloat(tbody.rows[r].cells[1].innerHTML)!=0) tbody.rows[r].style.fontWeight="bold";
				}
			}
		}
		if(d.RegionBreakdown){
			tbody=document.getElementById("ciq-table-fund-region-breakdown").getElementsByTagName("tbody")[0];
			tbody.parentNode.parentNode.style.display="block";
			for(var reg in d.RegionBreakdown){
				row=tbody.appendChild(tbody.rows[0].cloneNode(true));
				row.cells[0].innerHTML=reg;
				row.cells[1].innerHTML=parseFloat(d.RegionBreakdown[reg]).toFixed(2)+"%";
				row.style.display="";
			}
			for(var r=1;r<tbody.rows.length;r++){
				if(parseFloat(tbody.rows[r].cells[1].innerHTML)!=0) tbody.rows[r].style.fontWeight="bold";
			}
		}else{
			document.getElementById("ciq-table-fund-region-breakdown").getElementsByTagName("thead")[0].style.display="none";
			document.getElementById("ciq-table-fund-region-breakdown").getElementsByTagName("tbody")[1].style.display="";
		}
	}else{
		if(aq=="") {
			container.parentNode.parentNode.getElementsByClassName("no-financials")[0].style.display="block";		
			return;
		}
		document.getElementsByClassName("ciq-quote-feature")[0].style.visibility="";
		container.parentNode.style.display = "block";
		var ths = container.getElementsByTagName("TH");
		for (var i = 0; i < PageLimits.statements; i++) {
			if (section[i].Statement.Date) {
				if (!ths[i + 1]) ths[0].parentNode.appendChild(document.createElement("TH"));
				ths[i + 1].innerHTML = section[i].Statement.Date.toDateString().split(" ").slice(1).join(", ").replace(/,/, "");
			}
		}
		var fm = Financials.FieldMapping;
		for (var field in fm) {
			var row = document.getElementById(aq + "-" + field);
			if (!container.contains(row)) continue;
			if (row) {
				var id = fm[field].id;
				if (!id || id == "" || typeof (id) == "undefined") {
					row.style.display = "none";
					//}else if(!section[0].Statement.Fields[id] && !section[1].Statement.Fields[id] && !section[2].Statement.Fields[id]){
					//	row.style.display="none";
				} else {
					var tds = row.getElementsByTagName("TD");
					if (fm[field].textLabel) tds[0].innerHTML = fm[field].textLabel;
					for (var i = 0; i < PageLimits.statements; i++) {
						if (section[i].Statement.Type) {
							if (!tds[i + 1]) row.appendChild(document.createElement("TD"));
							if (!section[i].Statement.Fields[id]) {
								tds[i + 1].innerHTML = "-";
							} else {
								tds[i + 1].innerHTML = commaInt(section[i].Statement.Fields[id]);
							}
							if (!hasClass(row, section[i].Statement.Type)) row.style.display = "none";
							else row.style.display = "";
						}
					}
				}
			}
		}
	}
}

var today;

function setTodayDate() {
	today = new Date();
	today.setMilliseconds(0);
}
setTodayDate();

function getQuoteURL() {
	var href = "javascript:void(0);";
	var links = 0;
	if (getStyle(".mn-quotes-insiders", "display") != "none") {
		href = pageName("insiders");
		links++;
	}
	if (getStyle(".mn-quotes-filings", "display") != "none") {
		href = pageName("filings");
		links++;
	}
	if (getStyle(".mn-quotes-financials", "display") != "none") {
		href = pageName("financials");
		links++;
	}
	if (getStyle(".mn-quotes-company", "display") != "none") {
		href = pageName("company");
		links++;
	}
	if (getStyle(".mn-quotes-news", "display") != "none") {
		href = pageName("news");
		links++;
	}
	if (getStyle(".mn-quotes-overview", "display") != "none") {
		href = pageName("overview");
		links++;
	}
	if (links > 1) document.getElementsByClassName("ciq-quote-filter")[0].style.display = "block";
	return href;
}
var quoteURL = getQuoteURL();

var symbol = ""; {
	var sArr = queryStringValues("sym", location.search);
	if (sArr.length) symbol = sArr[0].toUpperCase();
	if (symbol == "") symbol = getSymbolList("quote-default").join("");
	var qmenu = document.getElementsByClassName("ciq-quote-filter")[0];
	var options = qmenu.getElementsByTagName("A");
	for (var a = 0; a < options.length; a++) {
		options[a].href += "?sym=" + encodeURIComponent(symbol);
	}
	var menu = document.getElementsByClassName("ciq-nav")[0];
	var options = menu.getElementsByTagName("A");
	for (var o = 0; o < options.length; o++) {
		if (hasClass(options[o].parentNode, "quotes")) options[o].href = quoteURL + "?sym=" + encodeURIComponent(symbol);
		else options[o].href += "?sym=" + encodeURIComponent(symbol);
	}

	document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "hidden";
	document.getElementsByClassName("ciq-content")[0].style.visibility = "hidden";
}

var retrieve = {}; {
	function convertToStyle(param) {
		if (param == "nav") return "ciq-navbar";
		else if (param == "q") return "ciq-quote-info";
		else if (param == "f") return "quote-financials";
		else return param;
	}
	var nodisc = queryStringValues("nodisc", location.hash);
	if (nodisc.length) {
		var footerSec = document.getElementsByClassName("ciq-footer");
		for (var s = 0; s < footerSec.length; s++) {
			footerSec[s].style.display = "none";
		}
	}
	var wArr = queryStringValues("sec", location.hash);
	if (wArr.length) {
		/*var sec = document.getElementsByClassName("ciq-overview-section");
		for (var s = 0; s < sec.length; s++) {
			sec[s].style.display = "none";
		}*/
		document.getElementsByClassName("ciq-quote-info")[0].style.display = "none";
		document.getElementsByClassName("ciq-navbar")[0].style.display = "none";


		for (var w = 0; w < wArr.length; w++) {
			retrieve[wArr[w]] = true;
			var widget = document.getElementsByClassName(convertToStyle(wArr[w]))[0];
			if (widget) {
				widget.style.display = "";
				widget.style.float = "none";
			}
		}
		document.getElementsByClassName("ciq-widget-container")[0].style.display = "";
	} else {
		retrieve = null;
	}
	document.getElementsByClassName("ciq-widget-container")[0].style.display = "";

}

var flags = Financials.Flags.DATA | Financials.Flags.STATEMENT;
var quoteRefreshRate = Number(getStyle(".quote-refresher", "z-index"));
if (isNaN(quoteRefreshRate)) quoteRefreshRate = 0;

var isETF=false;
function isMutual(symbol){
	if(isETF) return true;
	if(symbol.length<5 || symbol.length>6) return false;
	if(symbol[symbol.length-1]!="X") return false;
	for(var j=0;j<symbol.length;j++){
		if(symbol[j]<'A' || symbol[j]>'Z') return false;
	}
	return true;
}

var fundInfo=false;
var fundInfoEl=document.getElementsByClassName("ciq-get-fund-fundamentals");
if(fundInfoEl.length) fundInfo=getComputedStyle(fundInfoEl[0]).display.indexOf("block")>=0;

function setHeading(){
	if(fundInfo && isMutual(symbol)) jQuery("body").addClass("mutual-fund");
	var equityItems=document.getElementsByClassName("ciq-fundamental-equity");
	for(var ei=0;ei<equityItems.length;ei++) equityItems[ei].style.display=(fundInfo && isMutual(symbol))?"none":"";
	var fundItems=document.getElementsByClassName("ciq-fundamental-fund");
	for(var fi=0;fi<fundItems.length;fi++) fundItems[fi].style.display=!(fundInfo && isMutual(symbol))?"none":"";
}

if(getStyle(".quotes-access","display").indexOf("none")==-1 && getStyle(".mn-quotes-financials","display")!="none"){

	var quotePoll=function(){};
	if (document.getElementsByClassName("ciq-quote-info")[0].style.display != "none") {
		quotePoll = function () {
			setTodayDate();
			var fundQuoteObject=(fundInfo && isMutual(symbol))?{}:null;
			fetchDetailedQuote(v.Quote, fundQuoteObject, symbol, PageLimits.quote, PageLimits.industry, flags, function () {
				renderSection(document.getElementsByClassName("ciq-quote-info")[0], v.Quote);
				Financials.Statistics.Quote = new Date();
			});
			if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
		};
		quotePoll();
	}
	
	var dates=[];
	if(!fundInfo || !isMutual(symbol)){
		fetchRelevantDates(symbol,PageLimits.statements,"A",function(dates){
			if(dates && dates.length){
				fetchFinancialStatement(v.AnnualBalanceSheet,symbol,PageLimits.statements,"A/B",dates,function(aq){
					sortSection(v.AnnualBalanceSheet,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-balance-annual"),v.AnnualBalanceSheet,aq);
					Financials.Statistics.AnnualBalanceSheet=new Date();	
				});
				fetchFinancialStatement(v.AnnualIncome,symbol,PageLimits.statements,"A/I",dates,function(aq){
					sortSection(v.AnnualIncome,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-income-annual"),v.AnnualIncome,aq);
					Financials.Statistics.AnnualIncome=new Date();	
				});
				fetchFinancialStatement(v.AnnualCashFlow,symbol,PageLimits.statements,"A/C",dates,function(aq){
					sortSection(v.AnnualCashFlow,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-cash-annual"),v.AnnualCashFlow,aq);
					Financials.Statistics.AnnualCashFlow=new Date();	
				});
			}else if(fundInfo){
				isETF=true;
				quotePoll();
			}else{
				document.getElementsByClassName("ciq-quote-feature")[0].style.visibility="";
				document.getElementsByClassName("no-financials")[0].style.display="block";
				setHeading();
			}
		});
		fetchRelevantDates(symbol,PageLimits.statements,"Q",function(dates){
			if(dates && dates.length){
				fetchFinancialStatement(v.QuarterlyBalanceSheet,symbol,PageLimits.statements,"Q/B",dates,function(aq){
					sortSection(v.QuarterlyBalanceSheet,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-balance-quarterly"),v.QuarterlyBalanceSheet,aq);
					Financials.Statistics.QuarterlyBalanceSheet=new Date();	
				});
				fetchFinancialStatement(v.QuarterlyIncome,symbol,PageLimits.statements,"Q/I",dates,function(aq){
					sortSection(v.QuarterlyIncome,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-income-quarterly"),v.QuarterlyIncome,aq);
					Financials.Statistics.QuarterlyIncome=new Date();	
				});
				fetchFinancialStatement(v.QuarterlyCashFlow,symbol,PageLimits.statements,"Q/C",dates,function(aq){
					sortSection(v.QuarterlyCashFlow,Financials.Flags.STATEMENT);
					renderSection(document.getElementById("ciq-table-cash-quarterly"),v.QuarterlyCashFlow,aq);
					Financials.Statistics.QuarterlyCashFlow=new Date();	
				});
			}
		});
	}
}else{
	console.log("Feature not entitled");
}

//setTimeout("console.log(JSON.stringify(Financials.Viewables.QuarterlyCashFlow))",5000);
