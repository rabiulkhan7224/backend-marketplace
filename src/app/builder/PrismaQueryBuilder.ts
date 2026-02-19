/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Prisma Query Builder class for building complex queries with chaining methods
 * Similar pattern to the Mongoose QueryBuilder but adapted for Prisma
 */
class PrismaQueryBuilder<T extends Record<string, any>> {
  private prismaModel: any
  private query: Record<string, unknown>
  private whereClause: any = {}
  private orderBy: any[] = []
  private selectFields: any = null
  private skipValue: number | undefined
  private takeValue: number | undefined
  constructor(prismaModel: any, query: Record<string, unknown>) {
    this.prismaModel = prismaModel
    this.query = query
  }
  /**
   * Add search functionality to the query
   * @param searchableFields - Array of fields to search in
   * @returns PrismaQueryBuilder instance for chaining
   */
  search(searchableFields: string[]): this {
    const searchTerm = this.query.search as string
    if (searchTerm) {
      this.whereClause = {
        ...this.whereClause,
        OR: searchableFields.map(field => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }))
      }
    }
    return this
  }
  /**
   * Add filtering to the query
   * @returns PrismaQueryBuilder instance for chaining
   */
  filter(): this {
    const queryObj = { ...this.query }
    const excludeFields = ['search', 'sort', 'page', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObj[el])
    // Add the remaining query parameters to the where clause
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        this.whereClause = {
          ...this.whereClause,
          [key]: value
        }
      }
    })
    return this
  }
  /**
   * Add sorting to the query
   * @returns PrismaQueryBuilder instance for chaining
   */
  sort(): this {
    const sortField = this.query.sort as string
    if (sortField) {
      const sortFields = sortField.split(',')
      this.orderBy = sortFields.map(field => {
        const isDescending = field.startsWith('-')
        const fieldName = isDescending ? field.substring(1) : field
        return {
          [fieldName]: isDescending ? 'desc' : 'asc'
        }
      })
    } else {
      // Default sort by createdAt in descending order
      this.orderBy = [{ createdAt: 'desc' }]
    }
    return this
  }
  /**
   * Add pagination to the query
   * @returns PrismaQueryBuilder instance for chaining
   */
  paginate(): this {
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    this.skipValue = (page - 1) * limit
    this.takeValue = limit
    return this
  }
  /**
   * Field selection to include specific fields
   * @returns PrismaQueryBuilder instance for chaining
   */
  fields(): this {
    const fields = this.query.fields as string
    if (fields) {
      const fieldArray = fields.split(',')
      this.selectFields = fieldArray.reduce((acc, field) => {
        // Skip the __v field which doesn't exist in Prisma
        if (field !== '__v') {
          acc[field] = true
        }
        return acc
      }, {} as any)
    }
    return this
  }
  /**
   * Execute the query and return results with metadata
   * @returns Object with data and pagination metadata
   */
  async execute(): Promise<{
    data: T[]
    meta: {
      page: number
      limit: number
      totalData: number
      totalPage: number
    }
  }> {
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    // Build the query parameters
    const queryOptions: any = {
      where: this.whereClause,
      orderBy: this.orderBy.length > 0 ? this.orderBy : undefined,
      skip: this.skipValue,
      take: this.takeValue
    }
    // Add select if specified
    if (this.selectFields) {
      queryOptions.select = this.selectFields
    }
    // Get total count
    const totalData = await this.prismaModel.count({ where: this.whereClause })
    const totalPage = Math.ceil(totalData / limit)
    // Get data
    const data = await this.prismaModel.findMany(queryOptions)
    return {
      data,
      meta: {
        page,
        limit,
        totalData,
        totalPage
      }
    }
  }
  /**
   * Get total count and pagination metadata without fetching data
   * @returns Object with pagination metadata
   */
  async countTotal(): Promise<{
    page: number
    limit: number
    totalData: number
    totalPage: number
  }> {
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    const totalData = await this.prismaModel.count({ where: this.whereClause })
    const totalPage = Math.ceil(totalData / limit)
    return {
      page,
      limit,
      totalData,
      totalPage
    }
  }
}
export default PrismaQueryBuilder
