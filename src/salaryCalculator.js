
const secondThreshold = 120000

const months = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

export function calculateSalary(rows, workLocally, pit2Checked, increasedCosts,
                          incresedConstsBeginningMonth, increasedCostsRate, commonSettlement, ppkOn, ppkBeginningMonth, employeePPKRate, employerPPKRate) {
    const newRows = [];

    let increasedCostsFromBeginning = 0;

    const incomeCosts = (workLocally ? 250 : 300)

    for (let month = 0; month < 12; month++) {



        const grossSalary = rows[month].grossSalary
        const benefitsSalary = rows[month].benefitsSalary
        let grossSalarySum = grossSalary + benefitsSalary
        const pensionContribution = calculatePensionContribution(month, grossSalarySum);
        const disabilityPensionContribution = calculateDisabilityPensionContribution(month, grossSalarySum)

        let ppkEmployee = 0
        let ppkEmployer = 0

        if (ppkOn && ppkBeginningMonth <= month) {
            ppkEmployee = grossSalarySum * (ppkOn ? employeePPKRate : 0);
            ppkEmployer = grossSalarySum * (ppkOn ? employerPPKRate : 0);
        }
        // grossSalarySum+=ppkEmployer
        const sicknessContribution = grossSalarySum * 0.0245;
        const healthCareContribution = (grossSalarySum - sicknessContribution - disabilityPensionContribution - pensionContribution) * 0.09;

        let pitBase = grossSalarySum - sicknessContribution - disabilityPensionContribution - pensionContribution + ppkEmployer;

        let increasedCostsDeduction = 0
        let increasedCostsDeductionApplied = false
        if (increasedCosts && incresedConstsBeginningMonth <= month && increasedCostsFromBeginning < secondThreshold) {
            increasedCostsDeduction = (pitBase * increasedCostsRate) / 2

            if (increasedCostsFromBeginning + increasedCostsDeduction < secondThreshold) {
                pitBase = pitBase - increasedCostsDeduction;
            } else {
                pitBase = pitBase - (secondThreshold - increasedCostsFromBeginning);

            }
            increasedCostsDeductionApplied = true
        }
        increasedCostsFromBeginning += increasedCostsDeduction;

        pitBase = pitBase - incomeCosts;

        const pitBaseSinceBeginning = pitBase * month;

        let pit
        let pitWhenCommonSettlement
        let pit32 = false

        if ((pitBaseSinceBeginning + pitBase) < secondThreshold) {
            pit = (pitBase * 0.17);
        } else if ((pitBaseSinceBeginning + pitBase) > secondThreshold) {
            const pit17Base = Math.max(0, secondThreshold - pitBaseSinceBeginning)
            const pit32Base = pitBase - pit17Base;
            pit = (pit17Base * 0.17) + (pit32Base * 0.32)
            pit32 = true;
        }

        if ((pitBaseSinceBeginning + pitBase) < (secondThreshold * 2)) {
            pitWhenCommonSettlement = (pitBase * 0.17);
        } else if ((pitBaseSinceBeginning + pitBase) > (secondThreshold * 2)) {
            const pit17Base = Math.max(0, (secondThreshold * 2) - pitBaseSinceBeginning)
            const pit32Base = pitBase - pit17Base;
            pitWhenCommonSettlement = (pit17Base * 0.17) + (pit32Base * 0.32)
        }

        pit = pit - (pit2Checked ? (5100 / 12) : 0)
        pitWhenCommonSettlement = pitWhenCommonSettlement - (pit2Checked ? (10200 / 12) : 0)

        newRows.push({
            grossSalary,
            benefitsSalary,
            month: months[month],
            grossSalarySum,
            pensionContribution: pensionContribution,
            disabilityPensionContribution: disabilityPensionContribution,
            sicknessContribution: sicknessContribution,
            healthCareContribution: healthCareContribution,
            pit: Math.round(pit),
            pitWhenCommonSettlement,
            pit32,
            ppkEmployer,
            ppkEmployee,
            aboveCostDeduction: increasedCostsDeductionApplied,
            netto: grossSalary - sicknessContribution - disabilityPensionContribution - pensionContribution - healthCareContribution - pit - ppkEmployee
        });
    }


    let taxReturn = 0;
    if(!pit2Checked) {
        taxReturn += 5100 + (commonSettlement ? 5100 : 0)
    }
    if(commonSettlement) {
        let additionalReturn = 0;
        if(commonSettlement) {
            for (const newRow of newRows) {
                additionalReturn+=newRow.pit - newRow.pitWhenCommonSettlement
            }
        }
        taxReturn+=additionalReturn

    }

    return {rows: newRows, taxReturn}
}

function calculatePensionContribution(monthIndex, grossSalary) {
    const maxPensionContribution = 15398.35;
    const sumOfPensionContributionFromBeginning = monthIndex * (grossSalary * 0.0976)
    const currentPensionContribution = grossSalary * 0.0976
    if (sumOfPensionContributionFromBeginning > (maxPensionContribution - currentPensionContribution)) {
        return Math.max(0, maxPensionContribution - sumOfPensionContributionFromBeginning);
    } else {
        return currentPensionContribution;
    }
}

function calculateDisabilityPensionContribution(monthIndex, grossSalary) {
    const maxDisabilityPensionContribution = 2366.55;
    const sumOfPensionContributionFromBeginning = monthIndex * (grossSalary * 0.015)
    const currentMonthValue = grossSalary * 0.015
    if (sumOfPensionContributionFromBeginning > (maxDisabilityPensionContribution - currentMonthValue)) {
        return Math.max(0, maxDisabilityPensionContribution - sumOfPensionContributionFromBeginning);
    } else {
        return currentMonthValue;
    }
}