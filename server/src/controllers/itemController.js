import Joi from 'joi';
import { Item } from '../models/Item.js';

// TODO: write a validation schema for create/update per README.md section 2.
const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
const STATUSES = ['lost', 'found', 'claimed'];

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(1000).allow(''),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().max(200).allow(''),
  reportedBy: Joi.string().hex().length(24)
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(1000).allow(''),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().max(200).allow(''),
  reportedBy: Joi.string().hex().length(24)
}).min(1);

const filterSchema = Joi.object({
  status: Joi.string().valid(...STATUSES),
  category: Joi.string().valid(...CATEGORIES)
});


// GET /api/items
// TODO: implement per README.md section 3.
// GET /api/items?status=lost&category=electronics
export async function getAllItems(req, res, next) {
  try {
    const { value, error } = filterSchema.validate(req.query, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    //editedddd
    const items = await Item.find(value).populate('reportedBy', 'name email').sort({ createdAt: -1 }).lean();

    res.json({ items });
  } catch (err) { next(err); }
}



// GET /api/items/:id
// TODO: implement per README.md section 3.
export async function getItem(req, res, next) {
  try {
    // TODO
    //editedddd
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');

if (!item) return res.status(404).json({ message: 'Item not found' });
res.json({ item });

  } catch (err) { next(err); }
}

// POST /api/items
// TODO: implement per README.md section 3.
export async function createItem(req, res, next) {
  try {
    // TODO
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
if (error) return res.status(400).json({ message: error.message });

const item = await Item.create(value);
res.status(201).json({ item });

  } catch (err) {
    if (err.code === 11000) {
    return res.status(409).json({ message: 'This item is already reported at this location' });
  }
    next(err);
  }
}

// PATCH /api/items/:id
// TODO: implement per README.md section 3.
export async function updateItem(req, res, next) {
  try {
    // TODO
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
if (error) return res.status(400).json({ message: error.message });

const item = await Item.findByIdAndUpdate(
  req.params.id,
  { $set: value },
  { new: true, runValidators: true }
);
if (!item) return res.status(404).json({ message: 'Item not found' });
res.json({ item });

  } catch (err) { 
    if (err.code === 11000) {
    return res.status(409).json({ message: 'This item is already reported at this location' });
  }next(err); }
}

// DELETE /api/items/:id
// TODO: implement per README.md section 3.
export async function deleteItem(req, res, next) {
  try {
    // TODO
    const item = await Item.findByIdAndDelete(req.params.id);
if (!item) return res.status(404).json({ message: 'Item not found' });
res.json({ ok: true });

  } catch (err) { next(err); }
}
