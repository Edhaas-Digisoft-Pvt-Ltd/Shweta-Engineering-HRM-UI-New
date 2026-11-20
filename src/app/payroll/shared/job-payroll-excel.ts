import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

/**
 * Job based (die rate) payroll excel.
 *
 * Layout follows the "die_rate_Oct_26" salary sheet: one block per employee, blocks are placed side by side
 * (one empty column between them). Every block has
 *   - title + employee name
 *   - header row  : Date | die numbers
 *   - RATE row    : die rate
 *   - one row per day of the month with the jobs done on every die
 *   - Total row   : jobs per die      (=SUM of the days)
 *   - amount row  : total x rate      (=ROUND(total*rate))
 *   - salary summary (job salary, add / deductions, statutory, PT) and the yellow "Total Salary" row
 *
 * Used by Manage Payroll and Approve Payroll, so both screens always produce the same sheet.
 *
 * Expected row (employee) fields - same names the payroll list APIs return:
 *   emp_name, die_details[{die_id, die_number, jobs_done, die_rate, amount}], die_daily[{work_date, die_id, jobs_done}],
 *   job_amount, misc_expense, adv_deduction, misc_deduction, deduction, pf_employee_deduction,
 *   pf_employer_contribution, esic_deduction, total_tax_deduction, net_salary
 */

const FONT_NAME = 'Times New Roman';
const SHEET_NAME = 'Job Payroll';
const SALARY_LABEL = 'JOB SALARY';
const DATE_FORMAT = '[$-409]d\\-mmm\\-yy;@';
const MIN_BLOCK_COLUMNS = 3;   // date + 2 die columns, keeps room for the summary label (2 cols) and value (1 col)
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const THIN: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FF000000' } };
const ALL_BORDERS: Partial<ExcelJS.Borders> = { top: THIN, left: THIN, bottom: THIN, right: THIN };

interface CellStyle {
  bold?: boolean;
  size?: number;
  horizontal?: ExcelJS.Alignment['horizontal'];
  wrap?: boolean;
  border?: Partial<ExcelJS.Borders>;
  fill?: string;
  numFmt?: string;
}

const num = (v: any): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const round = (v: number, digits: number): number => {
  const f = Math.pow(10, digits);
  return Math.round((v + Number.EPSILON) * f) / f;
};

function styleCell(cell: ExcelJS.Cell, s: CellStyle = {}) {
  cell.font = { name: FONT_NAME, size: s.size ?? 11, bold: !!s.bold };
  cell.alignment = { horizontal: s.horizontal ?? 'center', vertical: 'middle', wrapText: !!s.wrap };
  cell.border = s.border ?? ALL_BORDERS;
  if (s.fill) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.fill } };
  }
  if (s.numFmt) {
    cell.numFmt = s.numFmt;
  }
}

/** Download the job based payroll excel for the given employees (rows). */
export function exportJobPayrollExcel(rows: any[], year: number, month: number): void {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(SHEET_NAME, { views: [{ state: 'frozen', ySplit: 4 }] });

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = `${MONTHS_SHORT[month - 1]} ${String(year).slice(-2)}`;

  let startCol = 1;
  rows.forEach((emp: any) => {
    const lastCol = writeEmployeeBlock(ws, emp, startCol, year, month, daysInMonth, monthLabel);
    ws.getColumn(lastCol + 1).width = 4;   // gap between two employees
    startCol = lastCol + 2;
  });

  workbook.xlsx.writeBuffer().then((buffer: any) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `Payroll_job_based_${MONTHS_SHORT[month - 1]}_${year}.xlsx`);
  });
}

/** Writes one employee block and returns the last column used by it. */
function writeEmployeeBlock(
  ws: ExcelJS.Worksheet, emp: any, startCol: number, year: number, month: number,
  daysInMonth: number, monthLabel: string
): number {
  const dies: any[] = [...(emp.die_details ?? [])].sort((a: any, b: any) =>
    String(a.die_number).localeCompare(String(b.die_number), undefined, { numeric: true }));
  const daily: any[] = emp.die_daily ?? [];
  const hasDaily = daily.length > 0;

  const width = Math.max(1 + dies.length, MIN_BLOCK_COLUMNS);
  const lastCol = startCol + width - 1;
  const firstDieCol = startCol + 1;

  const R_TITLE = 1, R_NAME = 2, R_HEAD = 3, R_RATE = 4, R_FIRST = 5;
  const R_LAST = R_FIRST + daysInMonth - 1;
  const R_TOTAL = R_LAST + 1;
  const R_AMOUNT = R_LAST + 2;
  const R_SUMMARY = R_LAST + 3;

  const addr = (r: number, c: number) => ws.getCell(r, c).address;

  // jobs per (date, die)
  const jobsByDay = new Map<string, number>();
  daily.forEach((d: any) => {
    const key = `${String(d.work_date).substring(0, 10)}|${d.die_id}`;
    jobsByDay.set(key, (jobsByDay.get(key) ?? 0) + num(d.jobs_done));
  });

  // column widths
  ws.getColumn(startCol).width = 10;
  for (let c = startCol + 1; c <= lastCol; c++) {
    ws.getColumn(c).width = 9.5;
  }

  // ---- title + employee name (centered across the block) ----
  for (let c = startCol; c <= lastCol; c++) {
    const border: Partial<ExcelJS.Borders> = { top: THIN };
    if (c === startCol) border.left = THIN;
    if (c === lastCol) border.right = THIN;
    styleCell(ws.getCell(R_TITLE, c), { bold: true, size: 13, horizontal: 'centerContinuous', border });

    const border2: Partial<ExcelJS.Borders> = { bottom: THIN };
    if (c === startCol) border2.left = THIN;
    if (c === lastCol) border2.right = THIN;
    styleCell(ws.getCell(R_NAME, c), { bold: true, size: 13, horizontal: 'centerContinuous', border: border2 });
  }
  ws.getCell(R_TITLE, startCol).value = `Salary For the month of ${monthLabel}`;
  ws.getCell(R_NAME, startCol).value = emp.emp_name;

  // ---- header (Date + die numbers) and RATE row ----
  for (let c = startCol; c <= lastCol; c++) {
    styleCell(ws.getCell(R_HEAD, c), { bold: true, wrap: true });
    styleCell(ws.getCell(R_RATE, c), { bold: true });
  }
  ws.getCell(R_HEAD, startCol).value = 'Date';
  ws.getCell(R_RATE, startCol).value = 'RATE';
  dies.forEach((d: any, i: number) => {
    const dieNo = String(d.die_number).trim();
    ws.getCell(R_HEAD, firstDieCol + i).value = /^\d+$/.test(dieNo) ? Number(dieNo) : dieNo;
    ws.getCell(R_RATE, firstDieCol + i).value = num(d.die_rate);
  });

  // ---- one row per day ----
  for (let day = 1; day <= daysInMonth; day++) {
    const r = R_FIRST + day - 1;
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    styleCell(ws.getCell(r, startCol), { bold: true, size: 10, numFmt: DATE_FORMAT });
    ws.getCell(r, startCol).value = new Date(Date.UTC(year, month - 1, day));

    for (let c = firstDieCol; c <= lastCol; c++) {
      styleCell(ws.getCell(r, c));
      const die = dies[c - firstDieCol];
      const jobs = die ? jobsByDay.get(`${dateKey}|${die.die_id}`) : undefined;
      if (jobs) {
        ws.getCell(r, c).value = jobs;
      }
    }
  }

  // ---- Total row (jobs per die) and amount row (total x rate) ----
  for (let c = startCol; c <= lastCol; c++) {
    styleCell(ws.getCell(R_TOTAL, c), { bold: true, size: c === startCol ? 10 : 11 });
    styleCell(ws.getCell(R_AMOUNT, c), { bold: true });
  }
  ws.getCell(R_TOTAL, startCol).value = 'Total';

  dies.forEach((d: any, i: number) => {
    const c = firstDieCol + i;
    const totalJobs = num(d.jobs_done);

    ws.getCell(R_TOTAL, c).value = hasDaily
      ? { formula: `SUM(${addr(R_FIRST, c)}:${addr(R_LAST, c)})`, result: totalJobs }
      : totalJobs;

    ws.getCell(R_AMOUNT, c).value = {
      formula: `ROUND(${addr(R_TOTAL, c)}*${addr(R_RATE, c)},2)`,
      result: round(totalJobs * num(d.die_rate), 2)
    };
  });

  // ---- salary summary ----
  const summary: { label: string; value: any }[] = [
    {
      label: SALARY_LABEL,
      value: dies.length > 0
        ? {
          formula: `ROUND(SUM(${addr(R_AMOUNT, firstDieCol)}:${addr(R_AMOUNT, firstDieCol + dies.length - 1)}),2)`,
          result: num(emp.job_amount)
        }
        : num(emp.job_amount)
    },
    { label: 'Add Other', value: num(emp.misc_expense) },
    { label: 'Deduction Salary Adv', value: num(emp.adv_deduction) },
    { label: 'Other Deduction', value: num(emp.misc_deduction) },
    { label: 'Deduction', value: num(emp.deduction) },
    { label: 'PF Employee', value: num(emp.pf_employee_deduction) },
    { label: 'PF Employer', value: num(emp.pf_employer_contribution) },
    { label: 'ESIC', value: num(emp.esic_deduction) },
    { label: 'PT', value: num(emp.total_tax_deduction) },
  ];

  const valueCol = startCol + 2;
  summary.forEach((line, i) => {
    const r = R_SUMMARY + i;
    ws.mergeCells(r, startCol, r, startCol + 1);
    styleCell(ws.getCell(r, startCol), { bold: true, horizontal: 'left', border: { top: THIN, bottom: THIN, left: THIN } });
    styleCell(ws.getCell(r, startCol + 1), { bold: true, horizontal: 'left', border: { top: THIN, bottom: THIN } });
    ws.getCell(r, startCol).value = line.label;
    styleCell(ws.getCell(r, valueCol), { bold: true });
    ws.getCell(r, valueCol).value = line.value;
    ws.getRow(r).height = 19.5;
  });

  // ---- Total Salary (yellow) = job salary + add other - every deduction ----
  const rTotalSalary = R_SUMMARY + summary.length + 1;
  const v = (i: number) => addr(R_SUMMARY + i, valueCol);
  ws.mergeCells(rTotalSalary, startCol, rTotalSalary, startCol + 1);
  styleCell(ws.getCell(rTotalSalary, startCol), { bold: true, size: 12, horizontal: 'left', fill: 'FFFFFF00' });
  styleCell(ws.getCell(rTotalSalary, startCol + 1), { bold: true, size: 12, fill: 'FFFFFF00' });
  ws.getCell(rTotalSalary, startCol).value = 'Total Salary';
  styleCell(ws.getCell(rTotalSalary, valueCol), { bold: true, size: 12, fill: 'FFFFFF00', numFmt: '0' });
  ws.getCell(rTotalSalary, valueCol).value = {
    formula: `ROUND(${v(0)}+${v(1)}-${v(2)}-${v(3)}-${v(4)}-${v(5)}-${v(6)}-${v(7)}-${v(8)},0)`,
    result: num(emp.net_salary)
  };
  ws.getRow(rTotalSalary).height = 19.5;

  // ---- row heights like the source sheet ----
  ws.getRow(R_TITLE).height = 16.8;
  ws.getRow(R_NAME).height = 16.8;
  ws.getRow(R_HEAD).height = 70.5;
  ws.getRow(R_RATE).height = 20.25;
  ws.getRow(R_TOTAL).height = 15.75;
  ws.getRow(R_AMOUNT).height = 19.5;

  return lastCol;
}
