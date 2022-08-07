import { useEffect, useState } from "react"
import dayjs from "dayjs"
import timeZone from "dayjs-ext/plugin/timeZone"
import isBetween from "dayjs/plugin/isBetween"
import {
	Thermostat,
	KeyboardArrowDown,
	KeyboardDoubleArrowDown,
	Remove,
	KeyboardArrowUp,
	KeyboardDoubleArrowUp,
	Air,
	NavigationTwoTone,
} from "@mui/icons-material"
import "./WeatherApp.css"
dayjs.extend(timeZone)
dayjs.extend(isBetween)

const WeatherApp = () => {
	const [weatherData, setWeatherData] = useState()

	const fetchData = async () => {
		const url = "https://api.weather.gov/gridpoints/LWX/89,70/forecast/hourly"
		const response = await fetch(url)
		const data = await response.json()

		const nextFor = (weatherData) => {
			const newData = []
			for (let j = 0; j < weatherData.length; j++) {
				let temperatureTrend = ""
				if (j === 0 || weatherData[j].changeTemp === 0) {
					temperatureTrend = "same"
				} else if (
					Math.abs(weatherData[j].changeTemp) >
					Math.abs(weatherData[j - 1].changeTemp)
				) {
					temperatureTrend = "double"
				} else if (
					Math.abs(weatherData[j].changeTemp) ===
					Math.abs(weatherData[j - 1].changeTemp)
				) {
					temperatureTrend = "single"
				} else {
					temperatureTrend = "single"
				}
				let result = { ...weatherData[j], temperatureTrend }
				newData.push(result)
			}
			setWeatherData(newData)
		}

		const segmentedData = []
		for (let i = 0; i < 24; i++) {
			let changeTemp = 0
			const period = data.properties.periods

			if (period[i - 1]) {
				changeTemp = period[i].temperature - period[i - 1].temperature
			}
			let result = { ...period[i], changeTemp }
			segmentedData.push(result)
			if (i === 23) {
				nextFor(segmentedData)
			}
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	console.log("test", weatherData)

	const getBgColor = (time) => {
		const morn = "rgb(224,246,170, .4)"
		const day = "rgb(166, 239, 251, .5)"
		const eve = "rgb(197, 178, 240, .3)"
		const night = "rgb(29, 37, 58, .1)"
		const currentHour = dayjs(time).format("HH", {
			timeZone: "America/New_York",
		})

		if (currentHour >= 5 && currentHour <= 7) {
			return eve
		} else if (currentHour > 7 && currentHour < 17) {
			return day
		} else if (currentHour >= 17 && currentHour <= 19) {
			return eve
		} else if (currentHour > 19 || currentHour < 5) {
			return night
		}
	}

	return (
		<>
			<h1>24hr Weather - Tyson's Corner, VA</h1>
			<div className="weatherWrapper">
				{weatherData &&
					weatherData.map((period, idx) => {
						const {
							startTime,
							icon,
							shortForecast,
							temperature,
							temperatureUnit,
							windDirection,
							windSpeed,
							changeTemp,
							temperatureTrend,
						} = period
						const time = dayjs(startTime).format("h:mm A", {
							timeZone: "America/New_York",
						})
						let tempTrend
						if (temperatureTrend === "double" && changeTemp > 0) {
							tempTrend = <KeyboardDoubleArrowUp className="thermostatIcon" />
						} else if (temperatureTrend === "double" && changeTemp < 0) {
							tempTrend = <KeyboardDoubleArrowDown className="thermostatIcon" />
						} else if (temperatureTrend === "single" && changeTemp > 0) {
							tempTrend = <KeyboardArrowUp className="thermostatIcon" />
						} else if (temperatureTrend === "single" && changeTemp < 0) {
							tempTrend = <KeyboardArrowDown className="thermostatIcon" />
						} else {
							tempTrend = <Remove className="thermostatIcon" />
						}

						return (
							<div className="hourBlock" key={`card-${idx}`}>
								<div
									className="background"
									style={{ backgroundColor: getBgColor(startTime) }}
								></div>
								<div className="content">
									<h3 className="time">{time}</h3>
									<div className="tempWindWrap">
										<div className="temp">
											<Thermostat className="thermostatIcon" />
											<span>{tempTrend}</span>
											<p className="tempValue">
												{temperature} <span>&#xb0;</span> {temperatureUnit}
											</p>
										</div>
										<div className="wind">
											<div className="windIcons">
												<Air aria-label="wind" />
												<NavigationTwoTone
													aria-label={windDirection}
													className={`navArrow ${windDirection}`}
												/>
											</div>
											<p className="tempValue">{windSpeed}</p>
										</div>
									</div>
									<div className="forecastWrap">
										<img src={icon} alt={shortForecast} className="picture" />
										<span className="forecast">{shortForecast}</span>
									</div>
								</div>
							</div>
						)
					})}
			</div>
		</>
	)
}

export default WeatherApp
