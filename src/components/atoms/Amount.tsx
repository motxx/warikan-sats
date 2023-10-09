type Props = {
    currencyUnit: 'jpy' | 'usd';
    amount: number;
};

const numberFormat = (num: number): string => num.toLocaleString();

export const Amount: React.FC<Props> = (props: Props) => {
    return <>
        {props.currencyUnit === 'jpy' ? "\xA5" : '$'}
        {numberFormat(props.amount)}
    </>
}
