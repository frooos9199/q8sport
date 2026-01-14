import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'خطأ في جلب المنتج' }, { status: 500 });
  }
}

export const PATCH = requireAuth(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    const productId = params.id;
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const body = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    if (product.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا المنتج' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.productType) {
      const typeMap: { [key: string]: string } = {
        'car': 'CAR',
        'parts': 'PART',
        'accessories': 'PART'
      };
      updateData.productType = typeMap[body.productType.toLowerCase()] || body.productType.toUpperCase();
    }
    if (body.category) updateData.category = body.category;
    if (body.carBrand !== undefined) updateData.carBrand = body.carBrand;
    if (body.carModel !== undefined) updateData.carModel = body.carModel;
    if (body.carYear) updateData.carYear = parseInt(body.carYear);
    if (body.condition) {
      const conditionMap: { [key: string]: string } = {
        'new': 'NEW',
        'used': 'USED',
        'refurbished': 'REFURBISHED'
      };
      updateData.condition = conditionMap[body.condition.toLowerCase()] || body.condition.toUpperCase();
    }
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone;
    if (body.status) {
      const statusMap: { [key: string]: string } = {
        'active': 'ACTIVE',
        'sold': 'SOLD',
        'pending': 'PENDING'
      };
      updateData.status = statusMap[body.status.toLowerCase()] || body.status.toUpperCase();
    }
    if (body.images) updateData.images = body.images;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    const productId = params.id;
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    if (product.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا المنتج' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المنتج بنجاح'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
});
