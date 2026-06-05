package com.College_project.project.DTOs;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class InvestmentAdviceResponse {
    private String riskProfile;
    private BigDecimal recommendedMonthlyInvestment;
    private BigDecimal expectedAnnualReturns;
    private List<PortfolioAllocation> portfolioAllocation;
    private List<String> recommendations;
    private Map<String, BigDecimal> projectedGrowth;
    private String summary;
    private String methodUsed;
    private String methodDetails;
    
    // Getters and Setters
    public String getRiskProfile() { return riskProfile; }
    public void setRiskProfile(String riskProfile) { this.riskProfile = riskProfile; }
    
    public BigDecimal getRecommendedMonthlyInvestment() { return recommendedMonthlyInvestment; }
    public void setRecommendedMonthlyInvestment(BigDecimal recommendedMonthlyInvestment) { this.recommendedMonthlyInvestment = recommendedMonthlyInvestment; }
    
    public BigDecimal getExpectedAnnualReturns() { return expectedAnnualReturns; }
    public void setExpectedAnnualReturns(BigDecimal expectedAnnualReturns) { this.expectedAnnualReturns = expectedAnnualReturns; }
    
    public List<PortfolioAllocation> getPortfolioAllocation() { return portfolioAllocation; }
    public void setPortfolioAllocation(List<PortfolioAllocation> portfolioAllocation) { this.portfolioAllocation = portfolioAllocation; }
    
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    
    public Map<String, BigDecimal> getProjectedGrowth() { return projectedGrowth; }
    public void setProjectedGrowth(Map<String, BigDecimal> projectedGrowth) { this.projectedGrowth = projectedGrowth; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getMethodUsed() { return methodUsed; }
    public void setMethodUsed(String methodUsed) { this.methodUsed = methodUsed; }

    public String getMethodDetails() { return methodDetails; }
    public void setMethodDetails(String methodDetails) { this.methodDetails = methodDetails; }
}
