with open("input.txt") as f:
    final_output = f.read().splitlines()
    if not len(final_output):
        raise 'No length!'
    out = final_output.pop(0)
    while len(final_output):
        out += '\\n' + final_output.pop(0)

    with open('output.txt', 'w') as output:
        output.write(out)
    print('Finished!')
