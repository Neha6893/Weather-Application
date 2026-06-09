package com.cfs.Weather_API.dto;

import java.util.List;

public class WeatherForcastResponse {
    public WeatherResponse weatherResponse;
    public List<DayInfo> day ;

    public WeatherResponse getWeatherResponse() {
        return weatherResponse;
    }

    public void setWeatherResponse(WeatherResponse weatherResponse) {
        this.weatherResponse = weatherResponse;
    }

    public List<DayInfo> getDay() {
        return day;
    }

    public void setDay(List<DayInfo> day) {
        this.day = day;
    }
}
