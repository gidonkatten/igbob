import { useState, useCallback } from "react";

interface AlgoActionButtonProps {
  title: string,
  buttonText: string,
  buttonAction: () => any
}

const AlgoSignerActionButton = ({title, buttonText, buttonAction}: AlgoActionButtonProps) => {
  const [result, setResult] = useState(undefined);

  const onClick = useCallback(async () => {
    const res = await buttonAction();
    setResult(res);
  }, [buttonAction]);

  return (
    <>
      <h2>{title}</h2>
      <button onClick={onClick}>{buttonText}</button>
      {result && (
        <code>
          {result}
        </code>)
      }
    </>
  );
};

export default AlgoSignerActionButton;