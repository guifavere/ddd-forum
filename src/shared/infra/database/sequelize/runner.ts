async function runner(promises) {
  for (let command of promises) {
    try {
      await command();
    } catch (error) {
      if (error.original) {
        if (error.original.code === 'ER_DUP_ENTRY') {
          console.log('>>> Passable error occurred: ER_DUP_ENTRY');
        } else if (error.original.code === 'ER_DUP_FIELDNAME') {
          console.log('>>> Passable error occurred: ER_DUP_FIELDNAME');
        } else if (error.original.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log('>>> Passable error occurred: ER_CANT_DROP_FIELD_OR_KEY');
        } else if (error.name === 'SequelizeUnknownConstraintError') {
          console.log(">>> Passable error. Trying to remove constraint that's already been removed.");
        } else {
          console.log(error);

          throw new Error(error);
        }
      }
    }
  }
}

export default { run: runner };
