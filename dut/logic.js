var xlsxJS = document.createElement('script');
xlsxJS.src = "https://unpkg.com/xlsx@0.12.0/dist/xlsx.full.min.js";
document.head.appendChild(xlsxJS);

var scriptEl = document.createElement('script');
scriptEl.textContent = `
    
    var columnHeadings = [];
    var htmlPageDataHolder = [];
    var excelFileDataHolder = [];
    var bossArray = [];

	var vm = angular.element(document.getElementById('faqcontent')).scope();
    var doctype1 = vm.kycFAQPageVm.idDocTypes;
    var doctype2 = vm.kycFAQPageVm.nonIdDocumentsObj;
    
    doctype1.forEach(parent => parent.subType.forEach(child => htmlPageDataHolder.push([parent.key, child.key, parent.value, child.value, child.desc, child.inst])));
    doctype2.forEach(parent => parent.subType.forEach(child => htmlPageDataHolder.push([parent.key, child.key, parent.value, child.value, child.desc, child.inst])));

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
            excelFileDataHolder = [];
            var final = XL_row_object.map(curr => {
                var arr = Object.values(curr).map(val => val.trim());
                excelFileDataHolder.push([arr[0],arr[1],arr[2],arr[3],arr[4],arr[5]]);
            })
            shallowCompare();
        })
    }

    function shallowCompare(){
    	bossArray = [];
        console.clear();
        console.log('%cBelow is website data', 'background: blue; color: white; display: inline;');
        console.table(htmlPageDataHolder);
        console.log('%cBelow is excel file data', 'background: blue; color: white; display: inline;');
        console.table(excelFileDataHolder);

        console.log('%cComparing both the data now!', 'background: blue; color: white; display: inline;');

        if(htmlPageDataHolder.length !== excelFileDataHolder.length){
            console.log('%cSubType Ids of this webpage and the uploaded CCD does not match, please check CCD and CQ lists.', 'background: red; color: black; display: inline;');
            return;
        }

        for (var len = excelFileDataHolder.length, i = 0; i < len; i++) {
            var excelSubTypeKey = excelFileDataHolder[i][1];
            for (var j = 0; j < len; j++) {
                var htmlSubTypeKey = htmlPageDataHolder[j][1];
                if (htmlSubTypeKey == excelSubTypeKey) {
                    deepCompare(htmlPageDataHolder[j], excelFileDataHolder[i]);
                }
            }
        }

        if(bossArray.length > 0){
            console.log('%cDiscrepancy found!', 'background: red; color: black; display: inline;');
            console.log('%cOnly differencial data will be shown in the below table. Similar results will be shown as "null". Also Column "0" and "1" of the table are just for reference.', 'background: orange; color: black; display: inline;');
            console.table(bossArray);
        }else{
            console.log('%cAll seems fine!', 'background: green; color: white; display: inline;');
        }
    }

    function deepCompare(htmlData, excelData) {
        for (var i = 0; i < 6; i++) {
            var discrepancy = false;
            var newArray = [];
            for (var i = 0; i < 6; i++) {
                if (i <= 1) {
                    newArray.push(htmlData[i]);
                    continue;
                }
                if (htmlData[i] == excelData[i]) {
                    newArray.push(null);
                } else {
                    newArray.push(htmlData[i]);
                    discrepancy = true;
                }
            }
            if (discrepancy) {
                bossArray.push(newArray);
            }
        }
    }

    createFileReader();

    `;

document.head.appendChild(scriptEl);