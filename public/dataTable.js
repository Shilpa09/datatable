/**
 * @constructor
 * @function DataTable
 * @param {DomElement} parent
 * @param {Object} dataSource
 *
 */
function DataTable(parent, url) {
    this.parent = parent;
    this.url = url;
    this.dataSource = new DataSource();
    this.pageLimit = 10;
    this.pagingEnabled = true;
    this.currPage = 1;
    //this.currentData = [];
    if (!this.parent) {
        this.parent = document.body;
    }
    this.table = null;
    initData(this);
}

/**
 @API Instance Methods
**/
DataTable.prototype = {
    onRefreshData: onRefreshData,
    search: search,
    sort: sort,
    enablePaging: enablePaging,
    disablePaging: disablePaging,
    prevPage: prevPage,
    nextPage: nextPage,
    setColumnVisibility: setColumnVisibility,
    saveChanges: saveChanges
};

//make an AJAX call to get data from the server on load.
function initData(self) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      self.dataSource.data = JSON.parse(this.responseText);
      self.dataSource.headers = Object.keys(self.dataSource.data[0]);

      createTable(self);
      self.dataSource.getData(self.onRefreshData.bind(self), (self.currPage - 1) * self.pageLimit, self.currPage * self.pageLimit );
    }
  };
  xhttp.open("GET", self.url, true);
  xhttp.send();
}

//sork data on the page
function sort(id) {
  if (this.pagingEnabled) {
    this.dataSource.sortData(this.onRefreshData.bind(this), id, (this.currPage - 1) * this.pageLimit, this.currPage * this.pageLimit);
  } else {
    this.dataSource.sortData(this.onRefreshData.bind(this), id);
  }
}

//search for related data
function search() {
  var searchVal = document.getElementById('searchInput');
  this.dataSource.filterData(this.onRefreshData.bind(this), searchVal.value);
}

//to enable pagination
function enablePaging(val) {
  this.pageLimit = val;
  this.currPage = 1;
  this.pagingEnabled = true;
  this.dataSource.getData(this.onRefreshData.bind(this), (this.currPage - 1) * this.pageLimit, this.currPage * this.pageLimit );
}

//to disable pagination
function disablePaging() {
  this.pagingEnabled = false;
  this.currPage = 1;
  this.dataSource.getData(this.onRefreshData.bind(this));
}


function prevPage() {
  if (!this.pagingEnabled)
    return false;

  if (this.currPage == 1)
    return false;

  this.dataSource.getData(this.onRefreshData.bind(this), (this.currPage - 2) * this.pageLimit, (this.currPage - 1) * this.pageLimit );
  this.currPage -= 1;

  if (this.currPage == 1)
    return false;
  else
    return true;
}

function nextPage() {
  if (!this.pagingEnabled)
    return false;

  if (this.currPage * this.pageLimit >= this.dataSource.getTotal())
    return false;

  this.dataSource.getData(this.onRefreshData.bind(this), this.currPage * this.pageLimit, (this.currPage + 1) * this.pageLimit );
  this.currPage += 1;

  if (this.currPage * this.pageLimit >= this.dataSource.getTotal())
    return false;
  else
    return true;
}

//Set functionality to show/hide columns
function setColumnVisibility(state, value) {
    var idx = this.dataSource.headers.indexOf(value);
    if (idx == -1)
      return;

    console.log(idx);

    var style;
    if (state)
      style = 'block'
    else
      style = 'none';

    var rows = this.table.getElementsByTagName('tr');

    for (var i=0; i<rows.length; i++) {
      var cells = rows[i].getElementsByTagName('td');
      if (cells.length == 0)
        cells = rows[i].getElementsByTagName('th');
        cells[idx].style.display = style;
    }
    document.getElementById('colHide').value='';
  }

//save the edited cell data
  function saveChanges(elem, col, id) {
    this.dataSource.save(this.onRefreshData.bind(this), elem.innerText, this.dataSource.headers[col], id, this.url);
  }

/**
 * @private
 * @function createTable
 * @param {this} self - Data Table Instance
 */
function createTable(self) {
    self.table = document.createElement('TABLE');
    self.table.setAttribute("class", "table");
    self.parent.appendChild(self.table);
    
    var headerHtml = '<tr>';
    for (i in self.dataSource.headers) {
      headerHtml += '<th onclick="dataTable.sort(' + i + ')">' + self.dataSource.headers[i].toUpperCase() + '<i class="fa fa-sort" aria-hidden="true"></i>' + '</th>';
    }
    headerHtml += '</tr>';

   var thead = document.createElement('THEAD');
   thead.innerHTML = headerHtml;
   self.table.appendChild(thead);
}

//fetch or update data
function onRefreshData(data) {
    cleanTableBody(this);
    self = this;
    var rows = data.records.map(function(record, ind) {
        var recordData = record;
        var bodyHtml = '<tr id="row' + ind + '">';
        for (i in self.dataSource.headers) {
            if (self.dataSource.headers[i] === "id") {
                bodyHtml += '<td contenteditable="false" oninput="dataTable.saveChanges(this, ' + i.toString() + ', ' + record[self.dataSource.headers[0]] + ')">' + record[self.dataSource.headers[i]] + '</td>';
            } else {
                bodyHtml += '<td id="text" contenteditable="true" oninput="dataTable.saveChanges(this, ' + i.toString() + ', ' + record[self.dataSource.headers[0]] + ')">' + record[self.dataSource.headers[i]] + '</td>';
            }
        }
        bodyHtml += '</tr>';
        return bodyHtml;
    });

    var tbody = document.createElement('TBODY');
    tbody.innerHTML = rows.join('');
    this.table.appendChild(tbody);
}

function cleanTableBody(self) {
    //remove old tbody
    var tbody = self.table.getElementsByTagName('TBODY');
    if(tbody && tbody.length){
        self.table.removeChild(tbody[0]);
    }

}
