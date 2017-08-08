function DataSource() {
    this.data = [];
    this.headers = [];
    this.sortDir = true;
}

//set functions that are accessable from outside
DataSource.prototype = {
    getData: getData,
    getTotal: getTotal,
    filterData: filterData,
    sortData: sortData,
    save: save,
    updateData: updateData
}

function getData(cb, lowerLimit, upperLimit) {
    // If limits are passed, then send only subset data
    if (this.getData.arguments.length == 3)
        return cb({ records: this.data.slice(lowerLimit, upperLimit) });
    // If no limits are passed, then send complete data
    return cb({ records: this.data });
}

//get length of the whole data
function getTotal() {
    return this.data.length;
}

//filter data based on the value entered in the search field
function filterData(cb, value) {
    if (value.length == 0) {
        return cb({ records: this.data });
    }

    var res = this.data.filter(function(obj) {
        var keys = Object.keys(obj);
        for (i in keys) {
            if (typeof obj[keys[i]] === 'string') {
                if (obj[keys[i]].toLowerCase().includes(value.toLowerCase()))
                    return true;
            } else if (typeof obj[keys[i]] === 'number') {
                if (obj[keys[i]].toString().includes(value))
                    return true;
            } else {
                continue;
            }
        }
        return false;
    });
    return cb({ records: res });
}

//sort data in the current page in "ascending" or "descending"
function sortData(cb, id, lowerLimit, upperLimit) {
    if (arguments.length == 4) {
        sorteddata = this.data.slice(lowerLimit, upperLimit);
    } else {
        sorteddata = this.data.slice();
    }

    function sorter(id, sortDir) {
        return function(a, b) {
            if (typeof a[id] === 'string') {
                if (a[id].toLowerCase() > b[id].toLowerCase()) {
                    return (sortDir) ? 1 : -1;
                } else if (a[id].toLowerCase() < b[id].toLowerCase()) {
                    return (sortDir) ? -1 : 1;
                } else
                    return 0;
            } else {
                return (sortDir) ? (a[id] - b[id]) : (b[id] - a[id]);
            }
        };
    }

    sorteddata.sort(sorter(this.headers[id], this.sortDir));
    this.sortDir = !this.sortDir;
    return cb({ records: sorteddata });
}

//function to SAVE data in the table, ID is non editable
function save(cb, newVal, col, id, url) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/save", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    var data = {
        "id": id,
        "newVal": newVal,
        "colName": col,
        "url": url
    }
    self = this;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            self.updateData(cb, newVal, col, id);
        }
    };
    xhttp.send(JSON.stringify(data));

}

//update server with the updated/edited data.
function updateData(cb, newVal, col, id) {
    newData = this.data.map(function(rec) {
        if (rec.id == id) {
            rec.col = newVal;
        }
        return rec;
    });
    this.data = newData;
}