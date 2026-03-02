const sheetgrid=document.querySelector(".sheet-grid");
const cellEditor=document.querySelector("#cell-editor");
const addressInput=document.querySelector("#address-input");
const formulaInput=document.querySelector("#formula-input");
const menuitems=document.querySelectorAll(".menu-item");
const boldbtn=document.getElementById("bold");
const italicbtn=document.getElementById("italic");
const underlinebtn=document.getElementById("underline");
const sheetDB={};

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
            const address=String.fromCharCode(65+j)+(1+i);
            sheetDB[address]=createCellObject();
            sheetgrid.appendChild(cell);
        }
    }
}

// Creates Column-Row headers and Cells
addColumnHeaders(c);
addRowHeaders(r,c);

let selectedCell=null;
let isEditing=false

//Gets Address from cell
function getCellAddress(cell){
    const row=Number(cell.dataset.row);
    const col=Number(cell.dataset.col);

    const columnLetter=String.fromCharCode(65+col);
    return columnLetter+(row+1);
}

//Creates Cell Object
function createCellObject(){
    return{
        value:"",
        formula:"",
        parents:[],
        dependents:[]
    };
}

//Cycle Check
function hasCycle(startAddress,targetAddress){
    if(startAddress===targetAddress){
        return true;
    }

    const startCell=sheetDB[startAddress];

    for(let parent of startCell.parents){
        if(hasCycle(parent,targetAddress)){
            return true;
        }
    }

    return false;
}

//Extracts Reference
function extractCellRefs(formula){
    return formula.match(/[A-Z]+[0-9]+/g)||[];
}

//Adds Dependency
function addDependency(childAddress,parentAddress){

    // if(hasCycle(parentAddress,childAddress)){
    //     console.log("Circular dependency detected!");
    //     return false;
    // }
    const childCell=sheetDB[childAddress];
    const parentCell=sheetDB[parentAddress];
    
    if(!childCell.parents.includes(parentAddress)){
    childCell.parents.push(parentAddress);
    }
    if(!parentCell.dependents.includes(childAddress)){
    parentCell.dependents.push(childAddress);
    }
}

//Removes Dependency
function removeDependency(cellAddress){
    const cell=sheetDB[cellAddress];

    for(let parentAddress of cell.parents){
        const parentCell=sheetDB[parentAddress];

        parentCell.dependents=parentCell.dependents.filter(dep=>dep!==cellAddress);
    }
    cell.parents=[];
}

//Commit Formula
function commitFormula(cellAddress,inputValue){
    const cell=sheetDB[cellAddress];
    inputValue=inputValue.trim();
    if(!inputValue.startsWith("=")){
        removeDependency(cellAddress);

        cell.formula="";
        cell.value=inputValue;
        

        return true;
    }

    const newFormula=inputValue.toUpperCase();

    removeDependency(cellAddress);

    const refs=extractCellRefs(newFormula);

    for(let parent of refs){
        if(hasCycle(parent,cellAddress)){
            alert("Circular dependency detected!");
            return false;
        }
    }

    for(let parent of refs){
        addDependency(cellAddress,parent);
    }

    cell.formula=newFormula;
    cell.value=newFormula;
    return true;
}
//Saves Cell data while switching to another Cell
function commitEdit(){
    const address=getCellAddress(selectedCell);
    const inputValue=cellEditor.value.trim();

    const success=commitFormula(address,inputValue);
    
    if(!success){
        return false;
    }

    selectedCell.innerText=sheetDB[address].value||"";

    cellEditor.style.display="none";
    isEditing=false;

    return true;
}
//Adds EventListener to Formula input
formulaInput.addEventListener("keydown",function(e){
    if(e.key!=="Enter") return;
    if(!selectedCell) return;

    const address=getCellAddress(selectedCell);
    const inputValue=formulaInput.value.trim();

    const success=commitFormula(address,inputValue);

    if(!success) return;

    selectedCell.innerText=sheetDB[address].value||"";
});

formulaInput.addEventListener("blur",function(){
        if(!selectedCell) return;

        const address=getCellAddress(selectedCell);
        const inputValue=formulaInput.value.trim();

        const success=commitFormula(address,inputValue);

        if(!success) return;

        selectedCell.innerText=sheetDB[address].value|| "";
});

//Add EventListener to sheetgrid
sheetgrid.addEventListener("click",function(e){
    const clickedElement=e.target;

    if(!clickedElement.classList.contains("cell")) return;

    if(isEditing){
        const committed=commitEdit();
        if(!committed) return;
    }

    if(selectedCell){
        selectedCell.classList.remove("selected");
    }
    

    clickedElement.classList.add("selected");
    selectedCell=clickedElement;

    const address=getCellAddress(selectedCell);
    
    addressInput.value=address;

    formulaInput.value=sheetDB[address].formula||sheetDB[address].value||"";
    
});

//Add Editor function
function startEditing(text= ""){
    const rect=selectedCell.getBoundingClientRect();

    cellEditor.style.display="block";
    cellEditor.style.left=rect.left+window.scrollX+"px";
    cellEditor.style.top=rect.top+window.scrollY+"px";
    cellEditor.style.width=rect.width+"px";
    cellEditor.style.height=rect.height+"px";

    cellEditor.value=text;
    cellEditor.focus();
    cellEditor.setSelectionRange(
        cellEditor.value.length,
        cellEditor.value.length
    );

    isEditing=true;
}

//Handles double clicking cell Behaviour
sheetgrid.addEventListener("dblclick",function(e){
    const clicked=e.target;

    if(!clicked.classList.contains("cell")) return;
    selectedCell=clicked;

    const address=getCellAddress(selectedCell);
    const cellObject=sheetDB[address];

    if(cellObject.formula){
        startEditing(cellObject.formula);
    } else{
        startEditing(cellObject.value);
    }
});

//Add Global Keydown Listener
document.addEventListener("keydown",function(e){
    if(document.activeElement===formulaInput) return;
    if(document.activeElement===addressInput) return;
    if(!selectedCell) return;
      
    if(e.key==="Enter"&&isEditing){
        const committed=commitEdit();
        if(!committed) return;
        return;
    }
    if(isEditing) return;
  
    if(e.key==="Delete"&&selectedCell&&!isEditing){
        const address=getCellAddress(selectedCell);

        const success=commitFormula(address,"");

        if(success){
            selectedCell.innerText=sheetDB[address].value|| "";
            formulaInput.value="";
        }

        return;
    }

    if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){
        startEditing(e.key);
        e.preventDefault();
    }
});

//Implement bold,italic and undreline button
boldbtn.addEventListener("click",function(){
    if(!selectedCell) return;

    const isBold=selectedCell.style.fontWeight==="bold";

    selectedCell.style.fontWeight=isBold?"normal":"bold";
});

italicbtn.addEventListener("click",function(){
    if(!selectedCell) return;

    const isItalic=selectedCell.style.fontStyle==="italic";

    selectedCell.style.fontStyle=isItalic?"normal":"italic";
});

underlinebtn.addEventListener("click",function(){
    if(!selectedCell) return;

    const isUnderline=selectedCell.style.textDecoration==="underline";

    selectedCell.style.textDecoration=isUnderline?"none":"underline";
});

//Implements drop down menu 
menuitems.forEach((item)=>{
    const button=item.querySelector("button");
    button.addEventListener("click",function(e){
        e.stopPropagation();
        menuitems.forEach(i=>{
            if(i!==item){
                i.classList.remove("active");
            }
        });
       
        item.classList.toggle("active");
    });
});

document.addEventListener("click",function(){
    menuitems.forEach(item=>item.classList.remove("active"));
});

//Implements Address Input Moving
addressInput.addEventListener("keydown",function(e){
    if(e.key!=="Enter") return;
    
    const value=addressInput.value.trim().toUpperCase();
    
    const match= value.match(/([A-Z])(\d+)$/);
    if(!match) return;

    const colLetter=match[1];
    const rowNumber=Number(match[2]);
    
    const colIndex= colLetter.charCodeAt(0)-65;
    const rowIndex=rowNumber-1;

    const targetcell=document.querySelector(`.cell[data-row="${rowIndex}"][data-col="${colIndex}"]`);

    if(!targetcell) return;

    if(selectedCell){
        selectedCell.classList.remove("selected");
    }

    targetcell.classList.add("selected");
    selectedCell=targetcell;
    addressInput.value = getCellAddress(selectedCell);

    addressInput.blur();
    targetcell.scrollIntoView({block:"nearest"});
});

addressInput.addEventListener("input",function(){
    this.value=this.value.toUpperCase();
});