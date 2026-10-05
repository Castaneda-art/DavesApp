import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Vitrina() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSelling, setIsSelling] = useState(false);

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('https://davesapp.onrender.com/api/inventory');
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://davesapp.onrender.com/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        fetchInventory(); // Refrescar para reordenar por stock
        setFormData({ name: '', price: '', stock: '' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (id) => {
    setIsSelling(true);
    try {
      const res = await fetch(`https://davesapp.onrender.com/api/inventory/${id}/sell`, {
        method: 'PUT'
      });
      const result = await res.json();
      if (result.success) {
        fetchInventory(); // Refrescar para actualizar el orden y visual
      } else {
        alert(result.message || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('Error selling product:', error);
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#150E08] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <header className="mb-4">
          <h2 className="text-3xl font-bold text-white">Control de Vitrina</h2>
          <p className="text-white/70 mt-1">GestiÃ³n de inventario y venta rÃ¡pida de productos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario (Izquierda) */}
          <div className="lg:col-span-1 bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] h-fit">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E29547]" />
              Ingresar Producto
            </h3>
          
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Nombre del Producto</label>
              <input 
                type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Cera Moldeadora"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Precio de Venta ($)</label>
              <input 
                type="number" step="0.01" required value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ej. 25000"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Stock Inicial (Unidades)</label>
              <input 
                type="number" required min="0" value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Ej. 10"
                className="bg-[#3A2A1E] text-white focus:ring-2 focus:ring-[#E29547] border-none rounded-lg p-3 w-full transition-all placeholder:text-white/30"
              />
            </div>
            <button 
              type="submit" disabled={isLoading}
              className="w-full mt-4 bg-[#E29547] hover:bg-[#F2A65A] text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Registrar Producto'}
            </button>
          </form>
        </div>

        {/* CuadrÃ­cula de Inventario (Derecha) */}
        <div className="lg:col-span-2 bg-[#2C1E16] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#3A2A1E] flex flex-col max-h-[750px]">
          <h3 className="text-xl font-semibold text-white mb-6">Inventario Disponible</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {products.length === 0 ? (
                <p className="text-white/50 col-span-full text-center py-10 border border-dashed border-[#3A2A1E] rounded-xl">
                  No hay productos registrados en la vitrina.
                </p>
              ) : (
                products.map(product => {
                  const isLowStock = product.stock <= 2;
                  
                  return (
                    <div key={product.id} className={`p-5 bg-[#1A120D] rounded-xl flex flex-col justify-between transition-colors shadow-sm border ${isLowStock ? 'border-red-900/50' : 'border-[#3A2A1E] hover:border-[#E29547]/40'}`}>
                      <div className="mb-5">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-white text-lg leading-tight line-clamp-2">{product.name}</h4>
                          {isLowStock && (
                            <span className="bg-red-900/30 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest whitespace-nowrap">
                              Stock Bajo
                            </span>
                          )}
                        </div>
                        <p className="text-[#E29547] font-bold text-2xl mt-3">{formatCOP(product.salePrice)}</p>
                        <p className="text-sm text-white/70 mt-1">
                          Unidades disponibles: <span className={`font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>{product.stock}</span>
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleSell(product.id)}
                        disabled={isSelling || product.stock < 1}
                        className="w-full bg-[#E29547] hover:bg-[#F2A65A] text-white py-2.5 rounded-lg transition-all font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {product.stock < 1 ? 'Agotado' : 'Vender 1 Unidad'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
