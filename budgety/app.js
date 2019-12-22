
//Data Module
var budgetController=(function(){
    var Income= function (id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
    };
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage=-1;
    };
    Expenses.prototype.calculatePercentage = function (income) {
        if (income > 0) {
            this.percentage = Math.round((this.value / income) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expenses.prototype.getPercentage=function () {
        return this.percentage;
    };
    
    var data= {
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:-1,
    };
    var calcTotal =function(type){
        var sum=0;
        data.allItems[type].map(function (current) {
           sum += current.value;
        })
        data.totals[type]= sum;
    };        

    return{
        addItems:function (input) {
            var newItem,ID;
            if (data.allItems[input.type].length > 0) {
                ID = data.allItems[input.type][data.allItems[input.type].length - 1].id + 1;
            } else {
                ID = 0;
            };

            if (input.type === 'exp') {
                newItem = new Expenses(ID, input.description, input.value);
            } else if (input.type === 'inc') {
                newItem = new Income(ID, input.description, input.value);
            };

            data.allItems[input.type].push(newItem);
            return newItem;
        },
        calcBudget:function () {
            calcTotal('exp');
            calcTotal('inc');
            data.budget=data.totals.inc-data.totals.exp;
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage=-1;
            }
        },
        calcPercentage:function () {
            data.allItems.exp.forEach(function(current){
                current.calculatePercentage(data.totals.inc);
            })
        },
        getBudget:function () {
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage,
            }
        },
        getPercentages:function () {
            var perc=data.allItems.exp.map(function (current) {
                return current.getPercentage();
            })
            return perc;
        },
        deleteItem:function (type,id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                current.id;
            });
            
            index = ids.indexOf(id);
            data.allItems[type].splice(index, 1);
        },
        testing:function () {
            console.log(data);
        }
    };
})();




//UI Module
var UIController=(function () {
    
    var DOMstrings={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        container:'.container',
        incomeList:'.income__list',
        expenseList:'.expenses__list',
        budgetIncome:'.budget__income--value',
        budgetExpense:'.budget__expenses--value',
        budgetValue:'.budget__value',
        expPercentage:'.budget__expenses--percentage',
        itemPercentage:'.item__percentage',
        month:'.budget__title--month'
        
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        };
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };   
    return{
        getInput:function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) ,
            }
        },
        displayItems:function (input) {
            var html,newHtml;

            if(input.type==='inc'){
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(input.type==='exp'){
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };
            newHtml=html.replace('%id%',input.id);
            newHtml=newHtml.replace('%description%',input.description);
            newHtml=newHtml.replace('%value%',formatNumber(input.value,input.type));

            if(input.type==='inc'){
                document.querySelector(DOMstrings.incomeList).insertAdjacentHTML('beforeend', newHtml);
            }else if(input.type==='exp'){
                document.querySelector(DOMstrings.expenseList).insertAdjacentHTML('beforeend', newHtml);
            };
        },
        clearFields:function () {
            var field,fields;
            field=document.querySelectorAll(DOMstrings.inputValue+', '+DOMstrings.inputDescription);
            fields=Array.prototype.slice.call(field);
            fields.forEach(function (current) {
                current.value='';
            });
            fields[0].focus();
        },
        displayBudget:function (item) {
            item.budget>0?type='inc':type='exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(item.budget,type) ;
            document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(item.totalIncome,'inc');
            document.querySelector(DOMstrings.budgetExpense).textContent = formatNumber(item.totalExpense,'exp');
            if(item.totalIncome>0){
                document.querySelector(DOMstrings.expPercentage).textContent = item.percentage + '%';
            }else{
                document.querySelector(DOMstrings.expPercentage).textContent = '---';
            }
            
        },
        dispalyPercentage:function (item) {
            var field;
            field=document.querySelectorAll(DOMstrings.itemPercentage);
            fields=Array.prototype.slice.call(field);
            fields.forEach(function(current,index) {
                if (item[index] > 0) {
                    current.textContent = item[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        removeItem:function (ID) {
            document.getElementById(ID).parentNode.removeChild(document.getElementById(ID));
            
        },
        displayDate:function (params) {
            var date,months,year;
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            date=new Date();
            month=date.getMonth();
            year=date.getFullYear();

            
            
            document.querySelector(DOMstrings.month).textContent =months[month]+' '+year;
        },

        getDOM:function () {
            return DOMstrings;
        }
    };
})();




//Controller Module
var controller=(function (budgetCtrl,UICtrl) {
    var DOM=UICtrl.getDOM();
    
    var setupEventlisteners=function () {
        document.querySelector('.add__btn').addEventListener('click',ctrlAddItems);
        document.addEventListener('keypress',function (event) {
            if(event.keyCode===13 || event.which===13){
                ctrlAddItems();
            };
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };

    var ctrlAddItems=function () {
        var input;
        
        //1-get values from user
        input=UICtrl.getInput();
        //2-add the values to our data structure
       if(input.description !=='' && !isNaN(input.value) && input.value > 0){
            budgetCtrl.addItems(input);
           //3-display the values in UI
            UICtrl.displayItems(input);
            UICtrl.clearFields();
           //4-update UI
            updateUI();
       };
    };
    var ctrlDeleteItem=function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.removeItem(itemID);
            updateUI();
        };
        
    };
    var updateUI = function () {
        
        budgetCtrl.calcBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);

        budgetCtrl.calcPercentage();
        var percentage = budgetCtrl.getPercentages();
        UICtrl.dispalyPercentage(percentage);
    };

    return{
        init:function () {
            console.log('App. has started');
            setupEventlisteners();
            UICtrl.displayDate();
            getBudget:  {
                document.querySelector(DOM.budgetValue).textContent = 0;
                document.querySelector(DOM.budgetIncome).textContent = 0;
                document.querySelector(DOM.budgetExpense).textContent =0;
                document.querySelector(DOM.expPercentage).textContent = '---'
            };
        }
    };
})(budgetController,UIController);
controller.init();