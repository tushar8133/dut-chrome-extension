var zipjs = document.createElement('script');
zipjs.src = "https://unpkg.com/jszip@3.1.5/dist/jszip.min.js";
document.head.appendChild(zipjs);

var xlsxJS = document.createElement('script');
xlsxJS.src = "https://unpkg.com/xlsx@0.12.0/dist/xlsx.full.min.js";
document.head.appendChild(xlsxJS);

var scriptEl = document.createElement('script');
scriptEl.textContent = `
    
    var columnHeadings = [];
    var htmlPageDataHolder = {};
    var excelFileDataHolder = {};

	var vm = angular.element(document.getElementById('faqcontent')).scope();
    var doctype1 = vm.kycFAQPageVm.idDocTypes;
    var doctype2 = vm.kycFAQPageVm.nonIdDocumentsObj;
    
    doctype1.forEach(parent => parent.subType.forEach(child => htmlPageDataHolder[child.key] = [child.value, parent.key, parent.value, child.desc, child.inst]));
    doctype2.forEach(parent => parent.subType.forEach(child => htmlPageDataHolder[child.key] = [child.value, parent.key, parent.value, child.desc, child.inst]));

    function createFileReader(){
        var fileChooser = document.createElement('input');
        fileChooser.type = 'file';

        fileChooser.addEventListener('input', function () {
            readFile(fileChooser.files[0]);
            document.body.removeChild(fileChooser);
        });

        document.body.appendChild(fileChooser);
        fileChooser.click();
    }

    function readFile(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            convertExcelToJson(reader.result);
        };
        reader.onerror = function(e) {
            console.log('%cFile read error.', 'background: blue; color: white; display: inline;');
            console.log(e);
        };
        reader.readAsBinaryString(file);
    };

    function convertExcelToJson(data) {
        var workbook = XLSX.read(data, {type:'binary'});
        workbook.SheetNames.forEach(function(sheetName) {
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            var newObj = {};
            var final = XL_row_object.map(curr => {
                var arr = Object.values(curr).map(val => val.trim());
                newObj[arr[0]] = [arr[1],arr[2],arr[3],arr[4],arr[5]];
            })

            excelFileDataHolder = newObj;
            compare();
        })
    }

    function compare(){
        console.clear();
        console.log('%cBelow is website data', 'background: blue; color: white; display: inline;');
        console.table(htmlPageDataHolder);
        console.log('%cBelow is excel file data', 'background: blue; color: white; display: inline;');
        console.table(excelFileDataHolder);

        console.log('%cComparing both the data now!', 'background: blue; color: white; display: inline;');

        if(Object.keys(htmlPageDataHolder).length !== Object.keys(excelFileDataHolder).length){
            console.log('%cSubType Ids of this webpage and the uploaded CCD does not match, please check CCD and CQ lists.', 'background: red; color: black; display: inline;');
            var set1 = new Set(Object.keys(htmlPageDataHolder));
            var set2 = new Set(Object.keys(excelFileDataHolder));
            var setsDifference = new Set([...set1].filter(x=>!set2.has(x)));
            console.table(setsDifference);
            return;
        }

        var bossArray = [];
        Object.keys(htmlPageDataHolder).forEach(function(curr) {
            var arr1 = htmlPageDataHolder[curr];
            var arr2 = excelFileDataHolder[curr];
            var discrepancy = false;
            var newArray = [];
            for (var i = 0; i < 6; i++) {
                if (arr1[i] === arr2[i]) {
                    newArray.push(null);
                } else {
                    newArray.push(arr1[i]);
                    discrepancy = true;
                }
            }
            if(discrepancy){
                newArray.unshift(curr);
                var tableObj = {
                    "SubID Keys" : newArray[0],
                    "SubID Value" : newArray[1],
                    "ID Keys" : newArray[2],
                    "ID Values" : newArray[3],
                    "Descriptions" : newArray[4],
                    "Instructions" : newArray[5]
                }
                bossArray.push(tableObj);
            }
        })

        if(bossArray.length > 0){
            console.log('%cDiscrepancy found!', 'background: red; color: black; display: inline;');
            console.log('%cOnly differencial data will be shown in the below table. Similar results will be shown as "null". Also please ignore Column "0" of the table. This is to refer the SubType Ids', 'background: orange; color: black; display: inline;');
            console.table(bossArray);
        }else{
            console.log('%cAll seems fine!', 'background: green; color: white; display: inline;');
        }


    }

    createFileReader();

    `;

document.head.appendChild(scriptEl);