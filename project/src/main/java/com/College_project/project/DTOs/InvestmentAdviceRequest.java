package com.College_project.project.DTOs;

import java.math.BigDecimal;

public class InvestmentAdviceRequest {
    private BigDecimal riskTolerance; // 1-10, where 1 is very conservative, 10 is very aggressive
    private BigDecimal investmentHorizon; // in years
    private BigDecimal monthlyInvestmentCapacity;
    private String goal; // RETIREMENT, HOUSE, EDUCATION, WEALTH_GROWTH
    
    // Getters and Setters
    public BigDecimal getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(BigDecimal riskTolerance) { this.riskTolerance = riskTolerance; }
    
    public BigDecimal getInvestmentHorizon() { return investmentHorizon; }
    public void setInvestmentHorizon(BigDecimal investmentHorizon) { this.investmentHorizon = investmentHorizon; }
    
    public BigDecimal getMonthlyInvestmentCapacity() { return monthlyInvestmentCapacity; }
    public void setMonthlyInvestmentCapacity(BigDecimal monthlyInvestmentCapacity) { this.monthlyInvestmentCapacity = monthlyInvestmentCapacity; }
    
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
}