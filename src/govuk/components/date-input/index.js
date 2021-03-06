import React from 'react';
import { Hint, ErrorMessage, Fieldset, Input } from '../..';

function DateInput(props) {
  const {
    className,
    errorMessage,
    fieldset,
    formGroup,
    hint,
    id,
    items,
    namePrefix,
    onChange,
    day,
    month,
    year,
    disabled,
    ...attributes
  } = props;

  let describedBy = fieldset?.['aria-describedby']
    ? fieldset['aria-describedby']
    : '';

  let hintComponent;
  let errorMessageComponent;
  let dateInputItems = [];

  if (hint) {
    const hintId = `${id}-hint`;
    describedBy += ` ${hintId}`;
    hintComponent = <Hint {...hint} id={hintId} />;
  }

  if (errorMessage) {
    const errorId = id ? `${id}-error` : '';
    describedBy += ` ${errorId}`;
    errorMessageComponent = <ErrorMessage {...errorMessage} id={errorId} />;
  }
  
  // const date = value ? new Date(value) : "";
  // const [day,month,year] = date ? [date.getDate(),date.getMonth() + 1,date.getFullYear()] : ['','',''];

  if (items && items.length > 0) {
    dateInputItems = items;
  } else {
    dateInputItems = [
      {
        name: 'day',
        className: 'govuk-input--width-2',
        type: 'text',
        defaultValue: day,
      },
      {
        name: 'month',
        className: 'govuk-input--width-2',
        type: 'text',
        defaultValue: month,
      },
      {
        name: 'year',
        className: 'govuk-input--width-4',
        type: 'text',
        defaultValue: year,
      },
    ];
  }

  const itemComponents = dateInputItems
    .filter((item) => item)
    .map((item, index) => {
      const {
        name: itemName,
        inputMode: itemInputMode,
        label: itemLabel,
        reactListKey: itemReactListKey,
        id: itemId,
        className: itemClassName,
        pattern: itemPattern,
        ...itemAttributes
      } = item;

      return (
        <div key={itemReactListKey || index} className="govuk-date-input__item">
          <Input
            onChange={onChange}
            {...itemAttributes}
            label={{
              children:
                itemLabel ||
                itemName.charAt(0).toUpperCase() + itemName.slice(1),
              className: 'govuk-date-input__label',
            }}
            id={itemId || `${id}-${itemName}`}
            className={`govuk-date-input__input ${itemClassName || ''}`}
            name={namePrefix ? `${namePrefix}-${itemName}` : itemName}
            type="text"
            inputMode={itemInputMode || 'numeric'}
            pattern={itemPattern || '[0-9]*'}
            disabled={disabled}
          />
        </div>
      );
    });

  const innerHtml = (
    <>
      {hintComponent}
      {errorMessageComponent}
      <div
        className={`govuk-date-input ${className || ''}`}
        {...attributes}
        id={id}
      >
        {itemComponents}
      </div>
    </>
  );

  return (
    <div
      className={`govuk-form-group${
        errorMessage ? ' govuk-form-group--error' : ''
      } ${formGroup?.className || ''}`}
    >
      {fieldset ? (
        <Fieldset
          {...fieldset}
          aria-describedby={describedBy || null}
          role="group"
        >
          {innerHtml}
        </Fieldset>
      ) : (
        <>{innerHtml}</>
      )}
    </div>
  );
}

export { DateInput };
