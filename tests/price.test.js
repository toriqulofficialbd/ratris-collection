import { describe, it, expect } from "vitest";


function calculateTotal(products){

 return products.reduce(
   (sum,item)=>sum+item.price,
   0
 );

}



describe("Cart Calculation",()=>{


 it("should calculate total price",()=>{


 const products=[
   {
    name:"Ring",
    price:1000
   },
   {
    name:"Chain",
    price:2000
   }
 ];


 expect(
   calculateTotal(products)
 )
 .toBe(3000);


 });


});