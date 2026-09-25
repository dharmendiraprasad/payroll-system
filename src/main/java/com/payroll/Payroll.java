package com.payroll;

public class Payroll {

    // Calculates net salary after deducting tax (e.g., 10%)
    public double calculateNetSalary(double basicSalary, double bonus, double deductions) {
        double grossSalary = basicSalary + bonus;
        return grossSalary - deductions;
    }

    // Calculates tax amount based on percentage
    public double calculateTax(double salary, double taxRatePercentage) {
        return salary * (taxRatePercentage / 100.0);
    }
}