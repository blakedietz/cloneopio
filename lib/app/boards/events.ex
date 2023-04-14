defmodule App.Boards.Events do
  defmodule CardCreated do
    defstruct card: nil
  end

  defmodule CardMoved do
    defstruct card: nil
  end

  defmodule CardUpdated do
    defstruct card: nil
  end
end
