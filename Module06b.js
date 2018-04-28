function getYearData(year,svg1,svg2,svg3,svg4, tbl1, tbl2, tbl3, tbl4) {
d3.csv("https://raw.githubusercontent.com/akulapa/Data608-FinalProject/master/sample.csv", function(error, csv_data) {
	
	  function tabulate(data1, data2, columns, columnDispNames, tbl) {
		var grandTotal = 0;
		data1.forEach(function(d1) {
			var result = data2.filter(function(d2) {
				return d1.key === d2.key;
			});
			d1.Percentage = (((result[0] !== undefined) ? result[0].value : 0) * 100).toFixed(2) + "%" ;
			grandTotal = grandTotal + d1.value;
		});
		
		data1.push({key: "Grand Total", Percentage: "", value: grandTotal});
		
		console.log(data1);
		var table = d3.select(tbl).attr("class","table table-hover table-striped table-condensed")
		var thead = table.append('thead')
		var	tbody = table.append('tbody');
		
		// append the header row
		thead.append('tr')
		  .selectAll('th')
		  .data(columnDispNames).enter()
		  .append('th')
		    .text(function (column) { return column; });

		// create a row for each object in the data
		var rows = tbody.selectAll('tr')
		  .data(data1)
		  .enter()
		  .append('tr');

		// create a cell in each row for each column
		var cells = rows.selectAll('td')
		  .data(function (row) {
		    return columns.map(function (column) {
		      return {column: column, value: row[column]};
		    });
		  })
		  .enter()
		  .append('td')
		    .text(function (d) { return d.value; });

	  return table;
	}
	
	
	//Read CSV data and filter by year
	var filteredData = csv_data.filter(function(d){ 
			//( d["Year"] == 2017 || d["Criticality"]=="High" || d["Criticality"]=="Low")
			if( d["Year"] == year){ return d; } 
		});
	
	var filLen = filteredData.length
	console.log(filLen);
	
	//Group By Race
	var raceOrder = filteredData.sort(function (x, y) {
		var a = x.RaceOrder.toUpperCase(), b = y.RaceOrder.toUpperCase();
		if (a > b) {
			return 1;
		}
		if (a < b) {
			return -1;
		}
		return 0;
	});
	
	var racedata = d3.nest()
	  .key(function(d) { return d.Race; })
	  .rollup(function(v) { return v.length/filLen; })
	  .entries(raceOrder);
  
  	var racedataSum = d3.nest()
	  .key(function(d) { return d.Race; })
	  .rollup(function(v) { return v.length; })
	  .entries(raceOrder);
  
	//Group By Gender
	var genderdata = d3.nest()
	  .key(function(d) { return d.Sex; })
	  .rollup(function(v) { return v.length/filLen; })
	  .entries(filteredData);

	var genderdataSum = d3.nest()
	  .key(function(d) { return d.Sex; })
	  .rollup(function(v) { return v.length; })
	  .entries(filteredData);
	  
	  
	//Group By AgeGroup
	var ageOrderData = filteredData.sort(function (x, y) {
    return x.AgeOrder - y.AgeOrder;
	});
	
	var agedata = d3.nest()
	  .key(function(d) { return d.AgeGroup; })
	  .rollup(function(v) { return v.length/filLen; })
	  .entries(ageOrderData);
	  
	var agedataSum = d3.nest()
	  .key(function(d) { return d.AgeGroup; })
	  .rollup(function(v) { return v.length; })
	  .entries(ageOrderData);
	
	agedata = agedata.filter(function (d) {
		return d.value > 0;
         //el.sqft >= 500 && el.num_of_beds >=2 && l.num_of_baths >= 2.5;
	});
	
	//Group By Drug Type
	  var long_data = [];
	  var dsum = 0, oCol = " ", cVal = 0;
	  filteredData.forEach( function(row) {
		// Loop through all of the columns, and for each column
		// make a new row
		Object.keys(row).forEach( function(colname) {
		  // Ignore 'Year' and 'Race' columns
		  if(colname == "Year" || colname == "Race" || colname == "Sex" || colname == "Age" || colname == "AgeGroup" || colname == "AgeOrder" || colname == "RaceOrder") {
			return
		  }
		  cVal = 0;
		  oCol = colname;
		  if (row[colname] == "Y"){ cVal = 1;}
		  if (colname == "Other"){ oCol = "z"+colname;}
		  long_data.push({"Year": row["Year"], "Value": cVal, "Drug": colname, "DrugOder": oCol});
		  dsum = dsum + cVal
		});
	  });
  
	long_drugOrder = long_data.sort(function (x, y) {
		var a = x.DrugOder.toUpperCase(), b = y.DrugOder.toUpperCase();
		if (a > b) {
			return 1;
		}
		if (a < b) {
			return -1;
		}
		return 0;
	});
	
  	var drugdata = d3.nest()
	  .key(function(d) { return d.Drug; })
	  .rollup(function(v) { return d3.sum(v, function(g) {return g.Value; }) / dsum;})
	  .entries(long_drugOrder);
	  
  	var drugdataSum = d3.nest()
	  .key(function(d) { return d.Drug; })
	  .rollup(function(v) { return d3.sum(v, function(g) {return g.Value; });})
	  .entries(long_drugOrder);
	  
	drugdata = drugdata.filter(function (d) {
		return d.value > 0;
         //el.sqft >= 500 && el.num_of_beds >=2 && l.num_of_baths >= 2.5;
	});
	
	drugdataSum = drugdataSum.filter(function (d) {
		return d.value > 0;
         //el.sqft >= 500 && el.num_of_beds >=2 && l.num_of_baths >= 2.5;
	});
  
    console.log(agedata);
	console.log(agedataSum);
	console.log(drugdata);
	console.log(long_data);
	console.log(racedata);
	console.log(dsum);
	
	tabulate(drugdataSum, drugdata, ['key', 'value', 'Percentage'], ['Drug', 'Total', 'Percentage'], tbl1)	
	tabulate(agedataSum, agedata, ['key', 'value', 'Percentage'], ['Age Group', 'Total', 'Percentage'], tbl2)
	tabulate(racedataSum, racedata, ['key', 'value', 'Percentage'], ['Ethnicity ', 'Total', 'Percentage'], tbl3)
	tabulate(genderdataSum, genderdata, ['key', 'value', 'Percentage'], ['Gender', 'Total', 'Percentage'], tbl4)
	
	//Drug Type
	var svg = d3.select(svg1),
		margin = {top: 20, right: 20, bottom: 80, left: 50},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;
	
	console.log(height);
	
	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
		y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	  x.domain(drugdata.map(function(d) { return d.key; }));
	  y.domain([0, d3.max(drugdata, function(d) { return d.value; })]);

	  g.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x))
		  .selectAll("text")	
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-35)");;

	  g.append("g")
		  .attr("class", "axis axis--y")
		  .call(d3.axisLeft(y).ticks(5, "%"))
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", "0.71em")
		  .attr("text-anchor", "end")
		  .text("value");

	  var bar = g.selectAll(".bar")
		.data(drugdata)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return x(d.key); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("width", x.bandwidth())
		  .attr("height", function(d) { return height - y(d.value); });
	
	
	//Age Group
	var svg = d3.select(svg2),
		margin = {top: 20, right: 20, bottom: 80, left: 50},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;
	
	console.log(height);
	
	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
		y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	  x.domain(agedata.map(function(d) { return d.key; }));
	  y.domain([0, d3.max(agedata, function(d) { return d.value; })]);

	  g.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x))


	  g.append("g")
		  .attr("class", "axis axis--y")
		  .call(d3.axisLeft(y).ticks(5, "%"))
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", "0.71em")
		  .attr("text-anchor", "end")
		  .text("value");

	  var bar = g.selectAll(".bar")
		.data(agedata)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return x(d.key); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("width", x.bandwidth())
		  .attr("height", function(d) { return height - y(d.value); });
	
	
	//By Race
	var svg = d3.select(svg3),
		margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;
	
	console.log(height);
	
	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
		y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	  x.domain(racedata.map(function(d) { return d.key; }));
	  y.domain([0, d3.max(racedata, function(d) { return d.value; })]);

	  g.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x));

	  g.append("g")
		  .attr("class", "axis axis--y")
		  .call(d3.axisLeft(y).ticks(10, "%"))
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", "0.71em")
		  .attr("text-anchor", "end")
		  .text("value");

	  var bar = g.selectAll(".bar")
		.data(racedata)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return x(d.key); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("width", x.bandwidth())
		  .attr("height", function(d) { return height - y(d.value); });
	

	//Gender
	console.log(genderdata);
	var svg = d3.select(svg4),
		width = +svg.attr("width"),
		height = +svg.attr("height"),
		radius = Math.min(width, height) / 2,
		g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var color = d3.scaleOrdinal(["#d0743c", "#7b6888", "#ff8c00", "#a05d56", "#6b486b", "#98abc5", "#8a89a6"]);

	var pie = d3.pie()
		.sort(null)
		.value(function(d) { return d.value; });

	var path = d3.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);

	var label = d3.arc()
		.outerRadius(radius - 60)
		.innerRadius(radius - 60);
	
  var arc = g.selectAll(".arc")
    .data(pie(genderdata))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return color(d.data.key); });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.key + "(" + (d.data.value * 100).toFixed(2) + "%)"; });	
				
})
}