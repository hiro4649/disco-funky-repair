'use client'; // For Next.js 13+ to use client-side rendering
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const dataset: number[] = [12, 21.5, 12, 9, 12.5, 14, 6, 13];
        const labels: string[] = [
            "Airdrops",
            "Incentives",
            "Liquidity",
            "Foundation",
            "Stability",
            "Reserves",
            "Burns",
            "Partnerships",
        ];
        const colors: string[] = [
            "#4caf50", // Airdrops
            "#2196f3", // Incentives
            "#ff5722", // Liquidity
            "#ffc107", // Foundation
            "#9c27b0", // Stability
            "#00bcd4", // Reserves
            "#ff9800", // Burns
            "#e91e63", // Partnerships
        ];

        const chartWrapper = chartRef.current;
        if (!chartWrapper) return; // Guard clause if the ref is not set

        const width = chartWrapper.offsetWidth;
        const height = chartWrapper.offsetHeight;
        const isSmallScreen = width < 375; // Check if the screen width is less than 375px
        const minOfWH = Math.min(width, height) / 2;
        const initialAnimDelay = 300;
        const arcAnimDelay = 150;
        const arcAnimDur = 3000;
        const secDur = 1000;
        const secIndividualdelay = 150;

        const radius = minOfWH * 0.7;

        const svg = d3
            .select(chartWrapper)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "pieChart")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const arc = d3
            .arc<d3.PieArcDatum<number>>()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.6);

        const outerArc = d3
            .arc<d3.PieArcDatum<number>>()
            .innerRadius(radius * 0.8)
            .outerRadius(radius * 1.3);

        const pie = d3.pie<number>().value((d) => d);

        const midAngle = (d: d3.PieArcDatum<number>) =>
            d.startAngle + (d.endAngle - d.startAngle) / 2;

        const draw = () => {
            svg.append("g").attr("class", "lines");
            svg.append("g").attr("class", "slices");
            svg.append("g").attr("class", "labels");

            const slice = svg
                .select(".slices")
                .datum(dataset)
                .selectAll<SVGPathElement, d3.PieArcDatum<number>>("path")
                .data(pie)
                .enter()
                .append("path")
                .attr("fill", (d, i) => colors[i])
                .attr("d", arc)
                .attr("stroke-width", "25px")
                .attr("transform", "rotate(-180, 0, 0)")
                .style("opacity", 0)
                .transition()
                .delay((_, i) => i * arcAnimDelay + initialAnimDelay)
                .duration(arcAnimDur)
                .ease(d3.easeElastic)
                .style("opacity", 1)
                .attr("transform", "rotate(0,0,0)");

            slice.transition()
                .delay((_, i) => arcAnimDur + i * secIndividualdelay)
                .duration(secDur)
                .attr("stroke-width", "5px");

            const text = svg
                .select(".labels")
                .selectAll<SVGTextElement, d3.PieArcDatum<number>>("text")
                .data(pie(dataset))
                .enter()
                .append("text")
                .attr("dy", "0.5em")
                .style("opacity", 0)
                .style("fill", (_, i) => colors[i])
                .style("font-size", `${Math.max(15, radius / 15)}px`)
                .attr("transform", (d) => {
                    const pos = outerArc.centroid(d);
                    pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
                    return `translate(${pos})`;
                })
                .style("text-anchor", (d) =>
                    midAngle(d) < Math.PI ? "start" : "end"
                );
            text.each(function (d, i) {
                const textElement = d3.select(this);

                if (labels[i] === "Burns") {
                    // Display label and percentage on one line for "Burns"
                    textElement
                        .append("tspan")
                        .text(`Burns (${dataset[i]}%)`)
                        .attr("x", 0)
                        .attr("dy", "0em");
                } else if (isSmallScreen) {
                    // Display label and percentage on separate lines for small screens
                    textElement.append('tspan')
                        .text(labels[i])
                        .attr('x', 0)
                        .attr('dy', '0em');

                    textElement.append('tspan')
                        .text(`(${dataset[i]}%)`)
                        .attr('x', 0)
                        .attr('dy', '1.2em');
                } else {
                    // Default behavior for other labels
                    textElement
                        .append("tspan")
                        .text(`${labels[i]} (${dataset[i]}%)`)
                        .attr("x", 0)
                        .attr("dy", "0em");
                }
            });

            text.transition()
                .delay((_, i) => arcAnimDur + i * secIndividualdelay)
                .duration(secDur)
                .style("opacity", 1);

            const polyline = svg
                .select(".lines")
                .selectAll<SVGPolylineElement, d3.PieArcDatum<number>>(
                    "polyline"
                )
                .data(pie(dataset))
                .enter()
                .append("polyline")
                .style("opacity", 0.5)
                .transition()
                .duration(secDur)
                .delay((_, i) => arcAnimDur + i * secIndividualdelay)
                .attr("points", (d) => {
                    const pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);

                    const points = [
                        arc.centroid(d) as [number, number],
                        outerArc.centroid(d) as [number, number],
                        pos,
                    ];

                    return points.map((p) => p.join(",")).join(" ");
                });
        };

        draw();

        return () => {
            d3.select(chartWrapper).select("svg").remove();
        };
    }, []);

    return (
        <div>
            <div ref={chartRef} className='w-full h-[245px] relative flex justify-start'></div>
        </div>
    );
};

export default PieChart;
