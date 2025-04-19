'use client';

import { Button } from "../../components/Button/button";
import React from 'react';

export const AddProductButton = () => {
  const openDialog = () => {
    const dialog = document.getElementById('product-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal(); // Show the dialog when the button is clicked
    }
  };

  return (
    <Button variant="cta" onClick={openDialog}>Add new product</Button>
  );
};
