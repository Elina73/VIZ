
var attributes = new Map([["ACT_avg", 1],
        ["Reporter_family", 1],
        ["REPORTER_CITY", 1],
        ["REPORTER_STATE", 0],
        ["REPORTER_COUNTY", 0],
        ["BUYER_NAME", 1],
        ["BUYER_CITY", 1],
        ["BUYER_COUNTY", 1],
        ["NDC_NO", 1],
        ["QUANTITY", 1],
        ["TRANSACTION_DATE", 1],
        ["CALC_BASE_WT_IN_GM", 0],
        ["Product_Name", 1],
        ["Ingredient_Name", 1],
        ["Combined_Labeler_Name", 1]
    ]);

function drawBarChart(name) {
    var svg = d3.select("svg"),
        margin = 200, width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.append("text")
        .attr("transform", "translate(200,0)")
        .attr("x", 50)
        .attr("y", 50)
        .attr("font-size", "24px")
        .attr("font-face", "Book Antigua")
        .text("Number of Universities vs. " + name);
    //define axis: bar chart
    var x = d3.scaleBand().range([0, width]).padding(0.6),
        y = d3.scaleLinear().range([height, 0]);

    //group elements
    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");


    d3.csv("https://github.com/Elina73/VIZ/blob/main/NYS-DEA-pain-pill-records", function (error, data) {
        if (error) {
            throw error;
        }

        //calculate statistics of the selected variable over counts
        var content = data.map(function (d) { return d[name] });
        var counts = getCountsMap(content);

        var x_values = Array.from(counts.keys());
        var y_values = Array.from(counts.values());

        x.domain(x_values);
        y.domain([0, Math.max.apply(null, y_values)]);

        var combined = [];
        for (i = 0; i < x_values.length; i++) {
            combined.push([x_values[i], y_values[i]]);
        }

        //draw x axis
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("y", height - 250)
            .attr("x", width - 5)
            .attr("text-anchor", "end")
            .attr("font-face", "Book Antigua")
            .attr("font-size", "15px")
            .attr("stroke", "gray")
            .style("fill", "black")
            .text(name);

        //draw y axis
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("font-face", "Book Antigua")
            .attr("font-size", "15px")
            .attr("stroke", "gray")
            .style("fill", "black")
            .text("Number");

        //draw bars
        g.selectAll(".bar")
            .data(combined)
            .enter().append("rect")
            .attr("class", "bar")
            .on("mouseover", onMouseOver) //Add listener for the mouseover event
            .on("mouseout", onMouseOut)   //Add listener for the mouseout event
            .attr("x", function (d) { return x(d[0]); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("width", x.bandwidth())
            .transition()
            .ease(d3.easeLinear)
            .attr("height", function (d) { return height - y(d[1]); });
    });

    //mouseover event handler function
    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
            .transition()     // adds animation
            .attr('width', x.bandwidth() + 5)
            .attr("y", function (d) { return y(d[1]) - 10; })
            .attr("height", function (d) { return height - y(d[1]) + 10; })
            .style("fill", "#80BBF5")

        g.append("text")
            .attr('class', 'val')
            .attr("font-face", "Book Antigua")
            .attr('x', function () {
                return x(d[0]) + x.bandwidth() / 2;
            })
            .attr('y', function () {
                return y(d[1]) - 15;
            })
            .text(function () {
                return d[1];  // Value of the text
            });
    }

    //mouseout event handler function
    function onMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
            .transition()     // adds animation
            .attr('width', x.bandwidth())
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return height - y(d[1]); })
            .style("fill", "#4D8BC9");

        d3.selectAll('.val')
            .remove()
    }

    //calculate statistics
    function getCountsMap(content) {
        let counts = new Map();
        for (i = 0; i < content.length; i = i + 1) {
            if (counts.has(content[i])) {
                count = counts.get(content[i]);
                counts.set(content[i], count + 1);
            } else {
                counts.set(content[i], 1);
            }
        }
        return counts;
    }
}

function drawHistogram(name) {
    var svg = d3.select("svg"),
        margin = 200, width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    //define axises
    var x = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);



    // get the data
    d3.csv("https://github.com/Elina73/VIZ/blob/main/NYS-DEA-pain-pill-records", function (error, data) {
        if (error) {
            throw error;
        }

        //calculate domain
        var content = data.map(function (d) { return d[name] });
        var min = Math.min.apply(null, content);
        var max = Math.max.apply(null, content);
        x.domain([min, max + 1]);

        //initialize to bin size = 10
        updateBinSize(5, data);

        d3.select("#nBin").on("input", function () {
            d3.selectAll("g").remove();
            updateBinSize(this.value, data);
        });

    });

    function updateBinSize(nBin, data) {

        var histogram = d3.histogram()
            .value(function (d) { return d[name]; })
            .domain(x.domain())
            .thresholds(x.ticks(nBin)); // this is the number of bins

        //apply to the data and get bins
        var bins = histogram(data);
        //group elements
        var h = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

        svg.append("text")
            .attr("transform", "translate(200,0)")
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "24px")
            .attr("font-face", "Book Antigua")
            .text("Number of Universities vs. " + name);

        //draw x axis:
        h.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("y", height - 250)
            .attr("x", width - 100)
            .attr("text-anchor", "end")
            .attr("font-face", "Book Antigua")
            .attr("font-size", "15px")
            .attr("stroke", "gray")
            .style("fill", "black")
            .text(name);

        //draw y axis
        y.domain([0, d3.max(bins, function (d) { return d.length; })]);

        h.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("font-face", "Book Antigua")
            .attr("font-size", "15px")
            .attr("stroke", "gray")
            .style("fill", "black")
            .text("Number");

        h.selectAll(".bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr('class', 'bar')
            .on('mouseover', onMouseOverH)
            .on('mouseout', onMouseOutH)
            .merge(h)
            .transition()
            .ease(d3.easeLinear)
            .duration(500)
            .delay((d, i) => i * 50)
            .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr('width', function (d) { return x(d.x1) - x(d.x0) - 1; })
            .attr('height', function (d) { return height - y(d.length); })


        //mouseover event handler function
        function onMouseOverH(d, i) {
            d3.select(this).attr('class', 'highlight');
            d3.select(this)
                .transition()     // adds animation
                .attr('transform', function (d) {
                    return "translate(" + x(d.x0) + "," + (y(d.length) - 10) + ")";
                })
                .attr('width', function (d) { return x(d.x1) - x(d.x0) + 5; })
                .attr("height", function (d) { return (height - y(d.length) + 10); })
                .style("fill", "#ADB6BE");

            h.append("text")
                .attr('class', 'val')
                .attr("font-face", "Book Antigua")
                .attr('x', function () {
                    return (x(d.x0) + x(d.x1)) / 2;
                })
                .attr('y', function () {
                    return y(d.length) - 15;
                })
                .text(function () {
                    return d.length;  // Value of the text
                });
        }

        //mouseout event handler function
        function onMouseOutH(d, i) {// use the text label class to remove label on mouseout
            d3.select(this).attr('class', 'bar');
            d3.select(this)
                .transition()     // adds animation
                .attr('width', function (d) { return x(d.x1) - x(d.x0) - 1; })
                .attr('height', function (d) { return height - y(d.length); })
                .attr('transform', function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")" })
                .style("fill", "#4D8BC9");

            d3.selectAll('.val')
                .remove()
        }
    }

}

