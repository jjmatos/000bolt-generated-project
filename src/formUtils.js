let dynamicTable = null;
let formFields = [];

export function generateForm(data, container) {
  formFields = [];
  const form = document.createElement('form');
  data.forEach(item => {
    for (const key in item) {
      formFields.push({ name: key, type: 'text' });
      const label = document.createElement('label');
      label.textContent = `${key}:`;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.value = item[key];
      form.appendChild(label);
      form.appendChild(input);
    }
  });

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit';
  form.appendChild(submitButton);
  form.addEventListener('submit', handleSubmit);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = 'Save to TXT';
  saveButton.addEventListener('click', () => handleSave(form));
  form.appendChild(saveButton);

  container.appendChild(form);
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  addRowToTable(formObject);
}

export function handleSave(form) {
  const formData = new FormData(form);
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  const dataString = Object.entries(formObject)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const blob = new Blob([dataString], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'form-data.txt';
  link.click();

  const resultsContainer = document.getElementById('results');
  resultsContainer.textContent = 'Saved Data:\n' + dataString;
}

export function createDynamicTable() {
  const container = document.getElementById('dynamic-table-container');
  const saveTableButton = document.getElementById('saveTableButton');
  const loadTableButton = document.getElementById('loadTableButton');

  dynamicTable = document.createElement('table');
  const headerRow = dynamicTable.insertRow();
  const headers = formFields.map(field => field.name);
  headers.push('Actions');
  headers.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerRow.appendChild(headerCell);
  });

  container.insertBefore(dynamicTable, loadTableButton);
}

export function addRowToTable(data) {
  if (!dynamicTable) {
    createDynamicTable();
  }

  const row = dynamicTable.insertRow();
  formFields.forEach(field => {
    const cell = row.insertCell();
    cell.textContent = data[field.name] || '';
  });

  const actionsCell = row.insertCell();
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'edit-button';
  editButton.addEventListener('click', () => editRow(row));
  actionsCell.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-button';
  deleteButton.addEventListener('click', () => deleteRow(row));
  actionsCell.appendChild(deleteButton);
}

function deleteRow(row) {
  dynamicTable.deleteRow(row.rowIndex);
}

function editRow(row) {
  const cells = row.cells;
  const originalData = [];
  for (let i = 0; i < cells.length - 1; i++) {
    originalData.push(cells[i].textContent);
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cells[i].textContent;
    cells[i].textContent = '';
    cells[i].appendChild(input);
  }

  const actionsCell = cells[cells.length - 1];
  actionsCell.innerHTML = '';

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.className = 'save-button';
  saveButton.addEventListener('click', () => saveEdit(row, originalData));
  actionsCell.appendChild(saveButton);
}

function saveEdit(row, originalData) {
  const cells = row.cells;
  for (let i = 0; i < cells.length - 1; i++) {
    const input = cells[i].querySelector('input');
    cells[i].textContent = input.value;
  }

  const actionsCell = cells[cells.length - 1];
  actionsCell.innerHTML = '';

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'edit-button';
  editButton.addEventListener('click', () => editRow(row));
  actionsCell.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-button';
  deleteButton.addEventListener('click', () => deleteRow(row));
  actionsCell.appendChild(deleteButton);
}

export function addField(form) {
  const fieldName = prompt("Enter the name of the new field:");
  if (fieldName) {
    const fieldType = prompt("Enter the type of the new field (text, email, number):", "text");
    if (fieldType) {
      formFields.push({ name: fieldName, type: fieldType });
      const label = document.createElement('label');
      label.textContent = `${fieldName}:`;
      const input = document.createElement('input');
      input.type = fieldType;
      input.name = fieldName;

      const submitButton = form.querySelector('button[type="submit"]');
      form.insertBefore(label, submitButton);
      form.insertBefore(input, submitButton);

      createDynamicTable();
    }
  }
}

export function saveTableToTXT() {
  let tableText = '';
  const rows = dynamicTable.rows;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    for (let j = 0; j < cells.length - 1; j++) {
      tableText += cells[j].textContent + (j < cells.length - 2 ? ',' : '');
    }
    tableText += '\n';
  }

  const blob = new Blob([tableText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'table-data.txt';
  link.click();
}

export function loadTableFromTXT(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');

  formFields = headers.map(header => ({ name: header, type: 'text' }));

  createDynamicTable();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const rowData = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = values[j];
      }
      addRowToTable(rowData);
    }
  }
}
