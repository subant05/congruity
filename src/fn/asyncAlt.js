export default function asyncAlt(funcA, funcB) {
  return async function (data) {
    try {
      return (await funcA(data)) || (await funcB(data));
    } catch (e) {
      console.log(`alt: Error ${funcA.name} & ${funcB.name} `);
    }
  };
}
