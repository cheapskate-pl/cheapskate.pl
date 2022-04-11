import './App.css';
import * as React from 'react';
import {Fragment, useEffect, useState} from 'react';
import {calculateSalary} from "./salaryCalculator";
import ReactTooltip from 'react-tooltip';
import { months} from './constants' 


const plnFormatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
});


const STATE_KEY = "state";

const defaultMonthValue = {
    grossSalary: 0,
    benefitsSalary: 0
}

const defaults = {
    grossSalary: 0,
    benefitsSalary: 0,
    pit2Checked: true,
    workLocally: true,
    ppkOn: false,
    ppkBeginningMonth: 0,
    increasedCosts: false,
    increasedCostsBeginningMonth: 0,
    employeePPK: 0.02,
    employerPPK: 0.015,
    increasedCostsRate: 0.8,
    commonSettlement: false,
    payAlways17: false,
    commonSettlementWithSeparateSalary: false,
    taxReturn: 0,
    childrenNumber: 0,
    hasChildren: false,
    use12Percent: false,
    rows: months.map(() => ({...defaultMonthValue}))
};

const state = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");

function getInitialValue(name) {
    if (state && state[name] !== undefined) {
        return state[name]
    }
    return defaults[name]
}

function pitDetails(row) {
    if(!row.pit32) {
        return `stawka 17%`
    }
    return `stawka 32%`
}

function App() {

    const [grossSalary, changeGrossSalary] = useState(getInitialValue("grossSalary"));
    const [benefitsSalary, changeBenefitsSalary] = useState(getInitialValue("benefitsSalary"));
    const [pit2Checked, changePit2Checked] = useState(getInitialValue("pit2Checked"));
    const [workLocally, changeWorkLocally] = useState(getInitialValue("workLocally"));
    const [ppkOn, changePPKOn] = useState(getInitialValue("ppkOn"));
    const [ppkBeginningMonth, changePpkBeginningMonth] = useState(getInitialValue("ppkBeginningMonth"));
    const [increasedCosts, changeIncreasedCosts] = useState(getInitialValue("increasedCosts"));
    const [increasedCostsBeginningMonth, changeIncreasedCostsBeginningMonth] = useState(getInitialValue("increasedCostsBeginningMonth"));
    const [employeePPK, changeEmployeePPK] = useState(getInitialValue("employeePPK"));
    const [employerPPK, changeEmployerPPK] = useState(getInitialValue("employerPPK"));
    const [increasedCostsRate, changeIncreasedCostsRate] = useState(getInitialValue("increasedCostsRate"));
    const [taxReturn, changeTaxReturn] = useState(getInitialValue("taxReturn"));
    const [commonSettlement, changeCommonSettlement] = useState(getInitialValue("commonSettlement"));
    const [commonSettlementWithSeparateSalary, changeCommonSettlementWithSeparateSalary] = useState(getInitialValue("commonSettlementWithSeparateSalary"));
    const [payAlways17, setPayAlways17] = useState(getInitialValue("payAlways17"));
    const [rows, setRows] = useState(getInitialValue("rows"));
    const [hasChildren, setHasChildren] = useState(getInitialValue("hasChildren"));
    const [childrenNumber, setChildrenNumber] = useState(getInitialValue("childrenNumber"));
    const [use12Percent, setUse12Percent] = useState(getInitialValue("use12Percent"));
    

    useEffect(() => {
        const state = {
            grossSalary,
            benefitsSalary,
            pit2Checked,
            workLocally,
            ppkOn,
            ppkBeginningMonth,
            increasedCosts,
            increasedCostsBeginningMonth,
            employeePPK,
            employerPPK,
            increasedCostsRate,
            commonSettlement,
            commonSettlementWithSeparateSalary,
            hasChildren,
            childrenNumber,
            use12Percent,
            rows
        }
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }, [grossSalary,
        benefitsSalary,
        pit2Checked,
        workLocally,
        ppkOn,
        ppkBeginningMonth,
        increasedCosts,
        increasedCostsBeginningMonth,
        employeePPK,
        employerPPK,
        increasedCostsRate,
        commonSettlement,
        commonSettlementWithSeparateSalary,
        hasChildren,
        use12Percent,
        childrenNumber,
        rows]);


    const handleCheckboxInputChange = (setter) => (event) => {
        setter(event.target.checked)
    }

    const handleSelectInputChange = (setter) => (event) => {
        setter(event.target.value)
    }

    const changeCommonSettlementAndClearState = (value) => {
        changeCommonSettlement(value)
        if (!value) {
            changeCommonSettlementWithSeparateSalary(false)
        }
    }

    const calculate = (rows) => {
        const result = calculateSalary(rows, workLocally, pit2Checked, increasedCosts, increasedCostsBeginningMonth, increasedCostsRate, commonSettlement,
            ppkOn, ppkBeginningMonth, employeePPK, employerPPK, hasChildren, childrenNumber, use12Percent)
        setRows(result.rows)
        changeTaxReturn(result.taxReturn)
    }

    function onGrossSalaryChange(e) {
        if (!e.target.validity.patternMismatch) {
            changeGrossSalary(parseFloat(e.target.value));
        }
    }

    function onBenefitsSalaryChange(e) {
        if (!e.target.validity.patternMismatch) {
            changeBenefitsSalary(parseFloat(e.target.value));
        }
    }


    useEffect(() => {
        calculate(rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workLocally, pit2Checked, increasedCosts, increasedCostsBeginningMonth, increasedCostsRate, commonSettlement,
        ppkOn, ppkBeginningMonth, employeePPK, employerPPK, hasChildren, childrenNumber, use12Percent])

    const updateGrossInMonth = (month) => (event) => {
        const newRows = rows.map((row, index) => {
            if (index === month) {
                return {
                    ...row,
                    grossSalary: parseFloat(event.target.value)
                }
            }
            return row
        })
        setRows(newRows)
        calculate(newRows)
    }

    const updateBenefitInMonth = (month) => (event) => {
        const newRows = rows.map((row, index) => {
            if (index === month) {
                return {
                    ...row,
                    benefitsSalary: parseFloat(event.target.value)
                }
            }
            return row
        })
        setRows(newRows)
        calculate(newRows)
    }

    const copyGross = () => {
        const newRows = rows.map(row => {
            return {
                ...row,
                grossSalary: grossSalary,
                benefitsSalary: benefitsSalary
            }
        })
        calculate(newRows)
    }

    return (
        <div id="wrapper">
            <div id="main">
                <div className="inner">
                    <section>
                        <header className="major">
                            <h3>Twoje wynagrodzenie</h3>
                        </header>
                        <div className="posts">
                            <article>
                                <ul className="actions">
                                    <li>
                                        <h4>Wynagrodzenie brutto</h4>
                                        <input type="number" onChange={onGrossSalaryChange} value={grossSalary}></input>
                                        <p>Wpisz kwotę, która widnienie na Twoje umowie o pracę. Uwzględnij tylko
                                            wynagrodzenie
                                            w formie pieniężnej.</p>
                                    </li>
                                    <li>
                                        <h4>Świadczenia niepieniężne (benefity)</h4>
                                        <input type="number" onChange={onBenefitsSalaryChange}
                                               value={benefitsSalary}></input>
                                        <p>Podaj wartosc wszsystkich dodatkowych składników wynagrodznie, które nie są
                                            wypłacanie
                                            w formie pieniężnej, np. ubezpieczenie medyczne lub karnet na siłownie.</p>
                                    </li>
                                    <li>
                                        <button onClick={copyGross}>Użyj dla wszsytkich miesięcy</button>
                                    </li>
                                </ul>

                            </article>

                            <article>
                                <h4>PPK</h4>
                                <ul className="actions">
                                    <li>
                                        <input type="checkbox" id="ppkCheckbox"
                                               checked={ppkOn} onChange={handleCheckboxInputChange(changePPKOn)}>
                                        </input>
                                        <label htmlFor="ppkCheckbox">Uczestniczę w PPK</label>
                                    </li>
                                    {ppkOn ? <Fragment>
                                        <li>
                                            <select value={employeePPK}
                                                    onChange={handleSelectInputChange(changeEmployeePPK)}>
                                                <option label="2,0%">0.02</option>
                                                <option label="2,5%">0.025</option>
                                                <option label="3,0%">0.03</option>
                                                <option label="3,5%">0.035</option>
                                                <option label="4,0%">0.04</option>
                                            </select>
                                            <label>Procent pobierany z wynagrodzenia pracownika</label>
                                        </li>
                                        <li>
                                            <select value={employerPPK}
                                                    onChange={handleSelectInputChange(changeEmployerPPK)}>
                                                <option label="1,5%">0.015</option>
                                                <option label="2,0%">0.02</option>
                                                <option label="2,5%">0.025</option>
                                                <option label="3,0%">0.03</option>
                                                <option label="3,5%">0.035</option>
                                                <option label="4,0%">0.04</option>
                                            </select>
                                            <label>Procent płacony przez pracodawcę</label>
                                        </li>
                                        <li>
                                            <select value={ppkBeginningMonth}
                                                    onChange={handleSelectInputChange(changePpkBeginningMonth)}>
                                                {months.map((month, index) => (
                                                        <option label={month}>{index}</option>
                                                    )
                                                )}

                                            </select>
                                            <label>Miesiąc zapisu do PPK</label>
                                        </li>
                                    </Fragment> : ''}
                                </ul>
                            </article>

                            <article>
                                <h4>Autorskie koszty uzyskania przychodu</h4>
                                <ul className="actions">
                                    <li>
                                        <input type="checkbox" id="kupCheckbox" checked={increasedCosts}
                                               onChange={handleCheckboxInputChange(changeIncreasedCosts)}>
                                        </input>
                                        <label htmlFor="kupCheckbox">
                                            Stosuję autorskie koszty uzyskania przychodu.
                                        </label>
                                    </li>
                                    {increasedCosts ?
                                        <Fragment>
                                            <li>
                                                <div>
                                                    <select value={increasedCostsRate}
                                                            onChange={handleSelectInputChange(changeIncreasedCostsRate)}>
                                                        <option label="80%">0.8</option>
                                                        <option label="70%">0.7</option>
                                                        <option label="60%">0.6</option>
                                                        <option label="50%">0.5</option>
                                                        <option label="40%">0.4</option>
                                                        <option label="30%">0.3</option>
                                                        <option label="20%">0.2</option>
                                                        <option label="10%">0.1</option>
                                                    </select>
                                                    <label>Procent pracy twórczej</label>
                                                </div>
                                                <div>
                                                    <select value={increasedCostsBeginningMonth}
                                                            onChange={handleSelectInputChange(changeIncreasedCostsBeginningMonth)}>
                                                        {months.map((month, index) => (
                                                                <option label={month}>{index}</option>
                                                            )
                                                        )}
                                                    </select>
                                                    <label>Miesiąc od którego stosować</label>
                                                </div>
                                            </li>
                                            <li></li>
                                        </Fragment> : ''}
                                </ul>
                            </article>
                            <article>
                                <h4>Sposób rozliczania</h4>
                                <ul className="actions">
                                    <li>
                                        <input type="checkbox" id="pit2checkbox" checked={pit2Checked}
                                               onChange={handleCheckboxInputChange(changePit2Checked)}></input>
                                        <label htmlFor="pit2checkbox">Złożylem PIT-2</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="workplaceCheckbox"
                                               checked={workLocally}
                                               onChange={handleCheckboxInputChange(changeWorkLocally)}></input>
                                        <label htmlFor="workplaceCheckbox">Pracuję w miejscu zamieszkania</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="use12Percent"
                                               checked={use12Percent}
                                               onChange={handleCheckboxInputChange(setUse12Percent)}></input>
                                        <label htmlFor="use12Percent">Zastosuj stawkę PIT 12% (Nowy Nowy Polski Ład)</label>
                                    </li>
                                </ul>
                            </article>
                            <article>
                                <h4>Wspólne rozlicznie z małżonkiem i ulgi</h4>
                                <ul className="actions">
                                    <li>
                                        <input type="checkbox" id="commonSettlement" checked={commonSettlement}
                                               onChange={handleCheckboxInputChange(changeCommonSettlementAndClearState)}>
                                        </input>
                                        <label htmlFor="commonSettlement">Wspólne rozliczenie</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="hasChildren" checked={hasChildren}
                                               onChange={handleCheckboxInputChange(setHasChildren)}>
                                        </input>
                                        <label htmlFor="hasChildren">Posiadam dzieci</label>
                                    </li>
                                    {
                                        hasChildren ?
                                        <li>
                                        <input type="number" id="childrenNumber" value={childrenNumber}
                                               onChange={handleSelectInputChange(setChildrenNumber)}>
                                        </input>
                                        <label htmlFor="childrenNumber">Ilosć dzieci</label>
                                    </li> : ''
                                    }
                                </ul>

                            </article>
                        </div>
                        {commonSettlementWithSeparateSalary ? <Fragment>
                            <header className="major">
                                <h3>Wynagrodzenie małżonka</h3>
                            </header>
                            <div className="posts">
                                <article>
                                    <h3>Wynagrodzenie brutto</h3>
                                    <ul className="actions">
                                        <li><input type="number"/></li>
                                    </ul>
                                    <p>Wpisz kwotę, która widnienie na Twoje umowie o pracę. Uwzględnij tylko
                                        wynagrodzenie
                                        w formie pieniężnej.</p>
                                </article>
                                <article>
                                    <h3>Świadczenia niepieniężne (benefity)</h3>
                                    <ul className="actions">
                                        <li><input type="number"/></li>
                                    </ul>
                                    <p>Podaj wartosc wszsystkich dodatkowych składników wynagrodznie, które nie są
                                        wypłacanie w formie pieniężnej, np. ubezpieczenie medyczne lub karnet na
                                        siłownie.</p>
                                </article>
                            </div>
                        </Fragment> : ''}
                    </section>
                    <section>
                        <header className="major">
                            <h3>Wynagrodznie misięczne</h3>
                        </header>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <td>Miesiąc</td>
                                    <td>Wynagrodzenie brutto</td>
                                    <td>Benefity</td>
                                    <td>Składka emerytalna</td>
                                    <td>Składka rentowa</td>
                                    <td>Składka chorobowa</td>
                                    <td>Składka zdrowotna</td>
                                    <td>Zaliczka PIT</td>
                                    {ppkOn ? <td>PPK pracownika</td> : undefined}
                                    <td>Netto</td>
                                </tr>
                                </thead>
                                <tbody>
                                {months.map((month, index) => {
                                        const row = rows[index]
                                        return (<tr key={index}>
                                            <td>{month}</td>
                                            <td>
                                                <input type="number" value={row.grossSalary}
                                                       onChange={updateGrossInMonth(index)}>
                                                </input>
                                            </td>
                                            <td>
                                                <input type="number" value={row.benefitsSalary}
                                                       onChange={updateBenefitInMonth(index)}>
                                                </input>
                                            </td>
                                            <td>{plnFormatter.format(row.pensionContribution)}</td>
                                            <td>{plnFormatter.format(row.disabilityPensionContribution)}</td>
                                            <td>{plnFormatter.format(row.sicknessContribution)}</td>
                                            <td>{plnFormatter.format(row.healthCareContribution)}</td>
                                            <td><p data-multiline="true" data-tip={pitDetails(row)}>{plnFormatter.format(row.pit)}</p></td>
                                            {ppkOn ? <td>{plnFormatter.format(row.ppkEmployee)}</td> : undefined}
                                            <td><strong>{plnFormatter.format(row.netto)}</strong></td>
                                        </tr>)
                                    }
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section>
                    <header className="major">
                            <h3>Podsumowanie roku</h3>
                        </header>
                        <div className="table-wrapper">
                        <table>
                                <thead>
                                <tr>
                                    <td>Suma wynagrodzenia brutto z benefitami</td>
                                    <td>Suma PPK (pracodawcy, pracownika)</td>
                                    <td>Suma Netto</td>
                                    <td>Srednia Netto</td>
                                    <td>Zwrot podatku</td>
                                    <td>Srednia Netto<br/> uwzgledniajac zwrot podatku</td>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{plnFormatter.format(rows.map(row => row.grossSalary + row.benefitsSalary).reduce((a,b) => a+b))}</td>
                                    <td>{plnFormatter.format(rows.map(row => row.ppkEmployee + row.ppkEmployer).reduce((a,b) => a+b))}&nbsp;
                                    ({plnFormatter.format(rows.map(row => row.ppkEmployer).reduce((a,b) => a+b))},&nbsp;  
                                    {plnFormatter.format(rows.map(row => row.ppkEmployee).reduce((a,b) => a+b))})</td>
                                    <td>{plnFormatter.format(rows.map(row => row.netto).reduce((a,b) => a+b))}</td>
                                    <td>{plnFormatter.format(rows.map(row => row.netto).reduce((a,b) => a+b) / 12)}</td>
                                    <td>{plnFormatter.format(taxReturn)}</td>
                                    <td><b>{plnFormatter.format((rows.map(row => row.netto).reduce((a,b) => a+b) + taxReturn)/12)}</b></td>
                                </tr>
                                </tbody>
                                </table>
                        </div>
                    </section>
                </div>
            </div>
            <ReactTooltip />
        </div>
    );
}

export default App;


