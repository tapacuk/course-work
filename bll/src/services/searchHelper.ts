export class SearchHelper {
  public async validateSearchInput(
    input: string,
    matchesLength: number
  ): Promise<boolean> {
    if (
      Number(input) < 0 ||
      Number(input) - 1 >= matchesLength ||
      isNaN(Number(input))
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export default SearchHelper;
