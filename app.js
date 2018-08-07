var budgetController = (function () {

	var Expense = function (id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calculatePercentage = function(totalInc) {
		
		if (totalInc > 0)
			this.percentage = Math.round((this.value / totalInc) * 100);
		else
			this.percentage = -1;
		
	};
	
	Expense.prototype.getPercentages = function() {
		return this.percentage;
	}

	var Income = function (id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
	};

	var GLOBAL_DATA = {
		allItems: {
			exp: [],
			inc: []
		},

		allTotals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}
	
	var calculateTotal = function(type) {
		var sum = 0;
		GLOBAL_DATA.allItems[type].forEach(function(curr) {
			sum += curr.value;
		});
		
		GLOBAL_DATA.allTotals[type] = sum;	
	};
	
	return {
		addItem: function (type, des, val) {
			var newItem, ID, arrItems;

			arrItems = GLOBAL_DATA.allItems[type];


			// Determine the ID
			if (arrItems.length > 0)
				ID = arrItems[arrItems.length - 1].id + 1;
			else
				ID = 0;


			// Identifying the type of the item
			if (type === 'exp')
				newItem = new Expense(ID, des, val);
			else
				newItem = new Income(ID, des, val);

			// Push the new item to the GLOBAL_DATA structure
			arrItems.push(newItem);
			return newItem;

		},
		
		deleteItem: function(type, id) {
			var ids, i;
			
			ids = GLOBAL_DATA.allItems[type].map(function(curr) {
				return curr.id;
			});
			
			i = ids.indexOf(id);
			
			if (i !== -1)
				GLOBAL_DATA.allItems[type].splice(i, 1);
		},
		
		calculatePercentage: function() {
			GLOBAL_DATA.allItems.exp.forEach(function(cur) {
				cur.calculatePercentage(GLOBAL_DATA.allTotals.inc);
			});
		},
		
		getPercentages: function() {
			var percs = GLOBAL_DATA.allItems.exp.map(function(cur) {
				return cur.getPercentages();
			});
			
			return percs;
		},
		
		calculateBudget: function() {
			
			// 1. Calculate total incomes and total expenses
			
			calculateTotal('inc');
			calculateTotal('exp');
			
			// 2. Calculate the final budget
			
			GLOBAL_DATA.budget = GLOBAL_DATA.allTotals.inc - GLOBAL_DATA.allTotals.exp;
			
			// 3. Calculate the percentage
			if (GLOBAL_DATA.allTotals.inc)
				GLOBAL_DATA.percentage = Math.round((GLOBAL_DATA.allTotals.exp / GLOBAL_DATA.allTotals.inc) * 100);
			else
				GLOBAL_DATA.percentage = -1;
		},
		
		getBudget: function() {
			return {
				budget: GLOBAL_DATA.budget,
				totalInc: GLOBAL_DATA.allTotals.inc,
				totalExp: GLOBAL_DATA.allTotals.exp,
				percentage: GLOBAL_DATA.percentage
			};
			
		},

		testing: function () {
			console.log(GLOBAL_DATA);
		}
	};



})();







var UIController = (function () {

	var DOMstrings = {
		type: '.add__type',
		desc: '.add__description',
		value: '.add__value',
		Btn: '.add__btn',
		incList: '.income__list',
		expList: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	
	var formatNumber = function(num, type) {
		
		var int, dec;
		
		num = Math.abs(num);
		num = num.toFixed(2);
		
		num = num.split('.');
		int = num[0];
		dec = num[1];
		
		if(int.length > 3)
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		
		return (type === 'exp'? '- ' : '+ ') + int + '.' + dec;
		
	};
	
	var nodesForEach = function(list, callback) {
				for (var i = 0; i < list.length; i++)
					callback(list[i], i)
	};

	return {
		getInput: function () {
			return {
				inputType: document.querySelector(DOMstrings.type).value,
				inputDesc: document.querySelector(DOMstrings.desc).value,
				inputValue: parseFloat(document.querySelector(DOMstrings.value).value)
			};
		},

		addListItem: function (obj, type) {
			var html, newHtml, e;

			// Create the UI of the item with placeholder
			if (type === 'inc') {
				e = DOMstrings.incList;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				e = DOMstrings.expList;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			// Edit this placeholder with actual data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.desc);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Add the item to the html
			document.querySelector(e).insertAdjacentHTML('beforeend', newHtml);



		},
		
		deleteListItem: function(itemID) {
			var e = document.getElementById(itemID);
			e.parentNode.removeChild(e);
		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.desc + ',' + DOMstrings.value);
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (curr) {
				curr.value = "";
			});

			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			
			var type;
			
			obj.budget >= 0? type = 'inc': type = 'exp';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if(obj.percentage > 0)
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			else
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
				
			
		},
		
		displayPercentages: function(percentages) {
			var nodes;
			
			nodes = document.querySelectorAll(DOMstrings.expPercLabel);
			
			nodesForEach(nodes, function(curr, i) {
				if (percentages[i] > 0)
					curr.textContent = percentages[i] + '%';
				else
					curr.textContent = '---';

			});	
			
		},
		
		displayDate: function() {
			var now, month, months, year;
			
			months = ['January', 'February', 'March', 'April', 'May', 'June', 
					  'July', 'August', 'September', 'October', 'November', 'December'];
			
			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
			
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
			
			
		},
		
		changeType: function() {
			var fields = document.querySelectorAll(DOMstrings.type + ',' + DOMstrings.desc + ',' + DOMstrings.value);
			nodesForEach(fields, function(curr) {
				curr.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.Btn).classList.toggle('red');
		},

		getDOMstrings: function () {
			return DOMstrings;
		}

	};




})();







var controller = (function (budgetCtrl, UICtrl) {

	var setupEventListeners = function () {
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.Btn).addEventListener('click', addItem);

		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 13 || e.which === 13)
				addItem();

		});
		
		document.querySelector(DOM.container).addEventListener('click', deleteItem);
		
		document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType)

	};

	var updateBudget = function () {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	
	var updatePercentages = function() {
		// 1. Calculate the percentages
		budgetCtrl.calculatePercentage();
		
		// 2. Read percentages
		var percs = budgetCtrl.getPercentages();
		
		// 3. Update the UI
		UICtrl.displayPercentages(percs);
		
	};


	function addItem() {
		var input, newItem;


		// 1. Get the fields input data
		input = UICtrl.getInput();

		if (input.inputDesc !== "" && !isNaN(input.inputValue) && input.inputValue > 0) {
			// 2. Add item to the budget controller
			newItem = budgetCtrl.addItem(input.inputType, input.inputDesc, input.inputValue);



			// 3. Add item to the UI and clearing fields
			UICtrl.addListItem(newItem, input.inputType);




			// 4. Clear the fields after adding items
			UICtrl.clearFields();
			
			
			// 5. Update budget
			updateBudget();
			
			
			// 6. Update percentages
			updatePercentages();
		}

	}
	
	var deleteItem = function(e) {
		var itemID, splitID, type, ID;
		
		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			
			
			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);
			
			
			// 3. Update the budget
			updateBudget();
			
			
			// 4. Update percentages
			updatePercentages();
			
			
		}
	}

	return {
		init: function () {
			console.log('Application has started');
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			setupEventListeners();
		}
	};


})(budgetController, UIController);

controller.init();

















