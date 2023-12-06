
export function init( schema ) {
  schema.define`
    t_crypto_web_token : object(
      crypto_web_token : object(
        tokenizer_password : string(),
      ),
    ),
  `;
  return schema;
};
