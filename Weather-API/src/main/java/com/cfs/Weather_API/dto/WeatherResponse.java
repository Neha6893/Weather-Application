package com.cfs.Weather_API.dto;

import org.springframework.stereotype.Component;

@Component
public class WeatherResponse {
    private String cityname;
    private String region;
    private String contry;
    private Double temp;
    private String condition;

    public WeatherResponse() {
    }

    public WeatherResponse(String cityname, String region, String contry, Double temp, String condition) {
        this.cityname = cityname;
        this.region = region;
        this.contry = contry;
        this.temp = temp;
        this.condition = condition;
    }

    public String getCityname() {
        return cityname;
    }

    public void setCityname(String cityname) {
        this.cityname = cityname;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getContry() {
        return contry;
    }

    public void setContry(String contry) {
        this.contry = contry;
    }

    public Double getTemp() {
        return temp;
    }

    public void setTemp(Double temp) {
        this.temp = temp;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }
}
