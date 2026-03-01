const sheetgrid=document.querySelector(".sheet-grid");

// function to add column headers
let r=100;
let c=26
function addColumnHeaders(c){
    for(let i=0;i<c;i++){
        const column=document.createElement("div");
        column.classList.add("column-header");
        column.dataset.col=i;
        column.textContent=String.fromCharCode(65+i);
        sheetgrid.appendChild(column);
    }
}

//function to add row headers
function addRowHeaders(r,c){
    for(let i=0;i<r;i++){
        const row=document.createElement("div");
        row.classList.add("row-header");
        row.dataset.row=i;
        row.textContent=1+i;
        sheetgrid.appendChild(row);

        for(let j=0;j<c;j++){
            const cell=document.createElement("div");
            cell.classList.add("cell");

            cell.dataset.row=i;
            cell.dataset.col=j;
            sheetgrid.appendChild(cell);
        }
    }
}

// Element creationg function Calls
addColumnHeaders(c);
addRowHeaders(r,c);