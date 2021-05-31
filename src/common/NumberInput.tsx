import NumberFormat from "react-number-format";

export function AlgoNumberInput(props) {
  return NumberInput({ ...props, hasDecimal: true, isDollar: false });
}

export function StableCoinInputNoDecimal(props) {
  return NumberInput({ ...props, hasDecimal: false, isDollar: true });
}

export function StableCoinInputWithDecimal(props) {
  return NumberInput({ ...props, hasDecimal: true, isDollar: true });
}

function NumberInput(props) {
  const { hasDecimal, isDollar, inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        });
      }}
      decimalScale={hasDecimal ? 6 : undefined}
      fixedDecimalScale={hasDecimal}
      thousandSeparator
      allowNegative={false}
      prefix={isDollar ? "$" : undefined}
    />
  );
}