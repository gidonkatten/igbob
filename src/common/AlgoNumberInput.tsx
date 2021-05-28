import NumberFormat from "react-number-format";

export function AlgoNumberInput(props) {
  const { inputRef, onChange, ...other } = props;

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
      decimalScale={6}
      fixedDecimalScale
      thousandSeparator
      allowNegative={false}
    />
  );
}