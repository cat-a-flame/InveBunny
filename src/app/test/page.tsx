// app/page.tsx
import { AddProductButton } from '../inventory/AddProductButton';
import { DialogForm } from './DialogForm';

export default function Home() {
  return (
    <>
      <div className="pageHeader">
        <h2 className="heading-title">Inventory</h2>
        <AddProductButton /> {/* Use the client-side button here */}
      </div>

      {/* DialogForm is now fully client-side */}
      <DialogForm />

      <div className="content">
        <p>Display your inventory or other information here.</p>
      </div>
    </>
  );
}
