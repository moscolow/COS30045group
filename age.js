        const width = 650;
        const height = 600;

        const svg = d3.select("#map")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", height);

        const tooltip = d3.select(".tooltip");

        let currentDataset = "all"; // Default dataset is "All"
        let currentYear = "2019";

        Promise.all([
            d3.json("southeast_asia.geojson"), 
            d3.csv("southeast_asia_data_number.csv")
        ]).then(([geojson, data]) => {
            data.forEach(d => {
                d.Age = d.Age.toLowerCase().replace(/\s+/g, "-"); // Replace spaces with hyphens
            });

            const dataByGroup = d3.group(data, d => d.Age, d => d.Year);

            const colorScales = {};
            for (let group of ["all", "more-than-64-years-old", "15-to-64-years-old", "less-than-15-years-old"]) {
                const groupData = Array.from(dataByGroup.get(group)?.values() || []).flat();
                const values = groupData.map(d => +d.Value);
                const domain = [d3.min(values), d3.max(values)];
                colorScales[group] = d3.scaleSequential(d3.interpolateOranges).domain(domain);
            }

            const projection = d3.geoMercator().fitSize([width, height], geojson);
            const path = d3.geoPath().projection(projection);

            function updateMap() {
                const group = currentDataset;
                const yearData = dataByGroup.get(group)?.get(currentYear) || [];
                const values = new Map(yearData.map(d => [d.Country, +d.Value]));

                geojson.features.forEach(feature => {
                    const countryName = feature.properties.name;
                    feature.properties.value = values.get(countryName) || null;
                });

                const countries = svg.selectAll(".country").data(geojson.features);

                countries.enter()
                         .append("path")
                         .attr("class", "country")
                         .attr("d", path)
                         .merge(countries)
                         .on("mouseover", (event, d) => {
                             tooltip.style("display", "block")
                                    .html(`${d.properties.name}<br>Value: ${d.properties.value !== null ? d.properties.value.toFixed(2) : "No Data"}`)
                                    .style("left", `${event.pageX + 5}px`)
                                    .style("top", `${event.pageY - 28}px`);
                         })
                         .on("mouseout", () => {
                             tooltip.style("display", "none");
                         })
                         .attr("fill", d => d.properties.value !== null ? colorScales[group](d.properties.value) : "#eeeeee");

                countries.exit().remove();

                updateLegend();
                updateRankTable(yearData);
            }

            function updateLegend() {
                const legendSvg = d3.select("#legend");
                legendSvg.selectAll("*").remove();
            
                const colorScale = colorScales[currentDataset];
                const domain = colorScale.domain();
                const legendHeight = 150;
                const legendWidth = 15;
            
                const gradientId = "legend-gradient";
                const defs = legendSvg.append("defs");
                const linearGradient = defs.append("linearGradient")
                    .attr("id", gradientId)
                    .attr("x1", "0%")
                    .attr("y1", "100%")
                    .attr("x2", "0%")
                    .attr("y2", "0%");
            
                const stops = d3.range(0, 1.01, 0.1); // Adjusted gradient steps
                stops.forEach((offset) => {
                    const value = domain[0] + offset * (domain[1] - domain[0]);
                    linearGradient.append("stop")
                        .attr("offset", `${offset * 100}%`)
                        .attr("stop-color", colorScale(value));
                });
            
                legendSvg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", legendWidth)
                    .attr("height", legendHeight)
                    .style("fill", `url(#${gradientId})`);
            
                const legendScale = d3.scaleLinear()
                    .domain(domain)
                    .range([legendHeight, 0]);
            
                const legendAxis = d3.axisRight(legendScale).ticks(5);
                legendSvg.append("g")
                    .attr("transform", `translate(${legendWidth + 5}, 0)`)
                    .call(legendAxis);
            }
                       

            function updateRankTable(data) {
                const table = d3.select("#rank-table");
                table.html(""); // Clear previous content
            
                const sortedData = data.slice().sort((a, b) => d3.descending(+a.Value, +b.Value));
            
                table.append("thead")
                     .append("tr")
                     .selectAll("th")
                     .data(["Rank", "Country", "Value"])
                     .enter()
                     .append("th")
                     .text(d => d);
            
                const rows = table.append("tbody")
                                  .selectAll("tr")
                                  .data(sortedData)
                                  .enter()
                                  .append("tr");
            
                rows.append("td").text((d, i) => i + 1); // Rank
                rows.append("td").text(d => d.Country); // Country
                rows.append("td").text(d => d3.format(",")(+d.Value)); // Value with commas
            }
            

            d3.select("#timeline-slider").on("input", function () {
                currentYear = this.value;
                d3.select("#current-year").text(currentYear);
                updateMap();
            });

            d3.selectAll("#buttons-container button").on("click", function () {
                d3.selectAll("#buttons-container button").classed("active", false);
                d3.select(this).classed("active", true);
                currentDataset = this.id;
                updateMap();
            });

            updateMap();
        });