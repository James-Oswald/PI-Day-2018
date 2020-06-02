function sum(x)
{
	var rv = 0;
	for(var i = 0; i < freqs.length; i++)
	{
		rv += Math.cos(freqs[i]	* 2 * Math.PI * x);
	}
	return rv;
}

function Trapazoidal(a, b, func, h)
{
	var rv = 0, d = (b - a) / h;
	for(var n = 1; n <= h; n++)
	{
		rv += d / 2 * (func(a + n * d) + func(a + (n - 1) * d));
	}
	return rv;
}

function wrapX(x)
{
	return sum(x) * Math.cos(-2 * Math.PI * x * fr)
}

function wrapY(x)
{
	return sum(x) * Math.sin(-2 * Math.PI * x * fr)
}

function fourierReal(x)
{
	fr = x;
	return Trapazoidal(0, 1, wrapX, intslices);
}

function fourierComplex(x)
{
	fr = x;
	return Trapazoidal(0, 1, wrapY, intslices);
}


//graphing
function graph(ctx, x, y, color, xMax, yMax, xIntervals = 4, yIntervals = 4, complex = false, xCenter = null, yCenter = null)
{
	const textSpace = 10;
	const cw = ctx.canvas.width;
	const ch = ctx.canvas.height;
	ctx.clearRect(0, 0, cw, ch);
	if(xCenter == null) xCenter = cw / 2;
	if(yCenter == null) yCenter = ch / 2;
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, yCenter);
	ctx.lineTo(cw, yCenter);
	ctx.moveTo(xCenter, 0);
	ctx.lineTo(xCenter, ch);
	ctx.stroke();
	var pxInterval = (cw - xCenter) / xIntervals;
	var xInterval = xMax / xIntervals;
	for(var i = -2 * xIntervals; i < 2 * xIntervals; i++)
	{
		ctx.beginPath();
		ctx.arc(pxInterval * i + xCenter, yCenter, 2, 0, 2 * Math.PI, false);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.fillText(Math.round(xInterval * i * 100) / 100 + "", pxInterval * i + xCenter + (i >= 0 ? -textSpace : textSpace), yCenter + textSpace);
	}
	var pyInterval = (ch - yCenter) / yIntervals;
	var yInterval = yMax / yIntervals;
	for(var i = -2 * yIntervals; i < 2 * yIntervals; i++)
	{
		ctx.beginPath();
		ctx.arc(xCenter, pyInterval * i + yCenter, 2, 0, 2 * Math.PI, false);
		ctx.fillStyle = "black";
		ctx.fill();
		if(i != 0)
		{
			ctx.fillText(Math.round(yInterval * -i * 100) / 100 + (complex ? "i" : ""), xCenter + textSpace, pyInterval * i + yCenter + (i >= 0 ? -textSpace : textSpace));
		}
	}
	var amp = (ch - yCenter) / yMax;
	var wl = (cw - xCenter)/ xMax;
	if(complex)
	{
		for(var t = 0; t < 2 * Math.PI; t += tstep)
		{
			var xp = amp * x(t) + xCenter;
			var yp = amp * -y(t) + yCenter;	
			ctx.strokeStyle = color;
			ctx.strokeRect(xp, yp, 1, 1);
		}
	}
	else
	{
		for(var t = 0; t < xMax; t += tstep)
		{
			var xp = x(t * wl) + xCenter;
			var yp = amp * -y(t) + yCenter;
			ctx.strokeStyle = color;
			ctx.strokeRect(xp, yp, 1, 1);
		}
	}
}

function graphNormal(ctx, color, f)
{
	graph(ctx, function(x){return x;}, f, color, 1.2, 1.2, 6, 2, false, 20);
}

function graphSum(ctx)
{
	graph(ctx, function(x){return x;}, function(x){return sum(x);}, "red", 1.2, freqs.length, 6, 2, false, 20)
}

function graphComplexFold(ctx, color, x, y)
{
	graph(ctx, x, y, color, 4, 4, 4, 4, true);
}

function graphSum(ctx)
{
	graph(ctx, function(x){return x;}, function(x){return sum(x);}, "red", 1.2, freqs.length + freqs.length / 6, 6, 2, false, 20)
}

function graphWrap(ctx)
{
	graphComplexFold(ctx, "green", function(x){return wrapX(x);}, function(x){return wrapY(x);});
}

function graphFourierReal(ctx)
{
	var max = Math.max(...freqs);
	graph(ctx, function(x){return x;}, function(x){return fourierReal(x);}, "red", max + (max % 2 == 0 ? 3 : 2), 1.2, 4, 2, false, 20);
}

function graphFourierComplex(ctx)
{
	var max = Math.max(...freqs);
	graph(ctx, function(x){return x;}, function(x){return fourierComplex(x);}, "cyan", max + (max % 2 == 0 ? 3 : 2), 1.2, 4, 2, false, 20);
}

function render()
{
	canvases = document.getElementsByTagName("canvas");
	var ctxs = [];
	for(var i = 0; i < canvases.length; i++)
	{
		canvases[i].onkeyup();
	}				
}

var freqs;

function newItem()
{
	var freqsi = document.getElementById("freqs");
	if(/[0-9]+(,[0-9]+)*/.test(freqsi.value))
	{
		var inputs = document.getElementById("fwraper");
		while(inputs.firstChild) 
		{
			inputs.removeChild(inputs.firstChild);
		}
		freqs = freqsi.value.replace(/, +/g, ",").split(",").map(Number);
		for(var i = 0; i < freqs.length; i++)
		{ 
			if(freqs[i] == 0)
			{
				freqs.splice(i, 1); 
			}
		} 
		if(showAll)
		{
			for(var i = 0; i < freqs.length; i++)
			{
				var node = document.createElement("p");
				node.innerHTML = "<i>s[" + i + "] = cos(" + (freqs[i] * 2) + "\u{1D70B}x)</i> = " + freqs[i] + " Hz";
				inputs.appendChild(node);
				inputs.innerHTML += "<canvas id='c" + i + "' onkeyup='graphNormal(this.getContext(\"2d\"), \"blue\", function(x){return Math.cos(2 * Math.PI * x *" + freqs[i] + ");})'>"
				
			}
		}
		render();
	}
}

var showAll = true;

function show()
{
	showAll = !showAll;
	newItem();
}

var tstep = 0.0005;
var intslices = 50;
var fr = 1;

function settings()
{
	intslices = parseFloat(document.getElementById("i").value);
	tstep = parseFloat(document.getElementById("t").value);
	fr = parseFloat(document.getElementById("f").value);
	newItem();
}


//depreciated, was used for art in the old version
function setGif(e, s, f)
{
	f++
	if(f > 3)
	{
		f = 1;
	}
	e.src = s + f + ".png";
	setTimeout(function(){setGif(e, s, f);}, 200);
}

window.onload = function()
{
	//setGif(document.getElementById("g1"), "pipie", 1);
	//setGif(document.getElementById("g2"), "piSki", 1);
	newItem();
};

//Ha bet you didn't expect to find these cool extrafast base64 encoders and decoders down here.
function base64Decode(number) {
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";
	let rv = 0;
	digits = number.split('');
	for(let i = 0; i < digits.length; i++) {
		rv = (rv * 64) + chars.indexOf(rixits[e]);
	}
	return result;
}

function base64Encode(number){
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";
	if (isNaN(Number(number)) || number === null || number === Number.POSITIVE_INFINITY || number < 0)
		throw "The input is not valid";
	let residual = Math.floor(number);
	let rv = "";
	while (residual != 0) {
		rv = chars.charAt(residual % 64) + rv;
		residual = Math.floor(residual / 64);
	}
	return rv;
}