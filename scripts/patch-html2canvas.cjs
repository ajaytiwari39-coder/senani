const fs = require("fs");
const path = require("path");

const targets = [
    path.join(__dirname, "..", "node_modules", "html2canvas", "dist", "html2canvas.esm.js"),
    path.join(__dirname, "..", "node_modules", "html2canvas", "dist", "html2canvas.js"),
    path.join(__dirname, "..", "node_modules", "html2canvas", "dist", "lib", "css", "types", "color.js")
];

targets.forEach(targetPath => {
    if (!fs.existsSync(targetPath)) return;

    let content = fs.readFileSync(targetPath, "utf8");
    if (content.includes("/* OKLCH_PATCH_APPLIED */")) {
        console.log("[patch-html2canvas] Already patched:", path.basename(targetPath));
        return;
    }

    const targetCode = 'var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];\n            if (typeof colorFunction === \x27undefined\x27) {\n                throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");\n            }\n            return colorFunction(context, value.values);';

    const replacementCode = `/* OKLCH_PATCH_APPLIED */
            var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
            if (typeof colorFunction === "undefined") {
                try {
                    var rawValues = value.values || [];
                    var parts = [];
                    for (var vi = 0; vi < rawValues.length; vi++) {
                        var tk = rawValues[vi];
                        if (tk.type === 17) {
                            parts.push(tk.number);
                        } else if (tk.type === 16) {
                            parts.push(tk.number + "%");
                        } else if (tk.type === 30 && tk.value) {
                            parts.push(tk.value);
                        } else if (tk.type === 20 && tk.value) {
                            parts.push(tk.value);
                        }
                    }
                    if (typeof document !== "undefined") {
                        var cvs = document.createElement("canvas");
                        cvs.width = 1;
                        cvs.height = 1;
                        var ctx = cvs.getContext("2d");
                        if (ctx) {
                            ctx.fillStyle = value.name + "(" + parts.join(" ") + ")";
                            ctx.fillRect(0, 0, 1, 1);
                            var imgD = ctx.getImageData(0, 0, 1, 1).data;
                            return pack(imgD[0], imgD[1], imgD[2], imgD[3] / 255);
                        }
                    }
                    if (value.name === "oklch" && parts.length >= 3) {
                        var l = parseFloat(parts[0]);
                        if (String(parts[0]).endsWith("%")) l = l / 100;
                        var c = parseFloat(parts[1]);
                        var h = parseFloat(parts[2]) || 0;
                        var a = parts.length >= 4 ? parseFloat(parts[parts.length - 1]) : 1;
                        if (isNaN(a)) a = 1;
                        var hr = (h * Math.PI) / 180;
                        var a_ = c * Math.cos(hr);
                        var b_ = c * Math.sin(hr);
                        var l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
                        var m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
                        var s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;
                        var l3 = l_ * l_ * l_;
                        var m3 = m_ * m_ * m_;
                        var s3 = s_ * s_ * s_;
                        var r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
                        var g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
                        var b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
                        var gamma = function(x) {
                            return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
                        };
                        return pack(
                            Math.round(Math.min(255, Math.max(0, gamma(r) * 255))),
                            Math.round(Math.min(255, Math.max(0, gamma(g) * 255))),
                            Math.round(Math.min(255, Math.max(0, gamma(b) * 255))),
                            a
                        );
                    }
                } catch (e) {}
                return pack(0, 0, 0, 1);
            }
            return colorFunction(context, value.values);`;

    if (content.includes(targetCode)) {
        content = content.replace(targetCode, replacementCode);
        fs.writeFileSync(targetPath, content, "utf8");
        console.log("[patch-html2canvas] Successfully patched:", path.basename(targetPath));
    } else {
        console.warn("[patch-html2canvas] Target code not found in:", path.basename(targetPath));
    }
});
