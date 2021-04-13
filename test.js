var url = require("url");
var path = require("path");
var parsed = url.pathToFileURL("https://eu.cdn.cloudam.xyz/dl/1/502033/489397/213542/5.180.62.46/30e326e1f775ccdb820e8119b02ce0efc7/movies/t/The_Croods_A_New_Age_2020_INTERNAL_720p_x265_BrRip_2CH_PSA_30NAMA.mkv");
console.log(path.basename(parsed.pathname));