defmodule App.CardsTest do
  use App.DataCase

  alias App.Cards

  describe "cards" do
    alias App.Cards.Card

    import App.CardsFixtures

    @invalid_attrs %{notes: nil}

    test "list_cards/0 returns all cards" do
      card = card_fixture()
      assert Cards.list_cards() == [card]
    end

    test "get_card!/1 returns the card with given id" do
      card = card_fixture()
      assert Cards.get_card!(card.id) == card
    end

    test "create_card/1 with valid data creates a card" do
      valid_attrs = %{notes: "some notes"}

      assert {:ok, %Card{} = card} = Cards.create_card(valid_attrs)
      assert card.notes == "some notes"
    end

    test "create_card/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Cards.create_card(@invalid_attrs)
    end

    test "update_card/2 with valid data updates the card" do
      card = card_fixture()
      update_attrs = %{notes: "some updated notes"}

      assert {:ok, %Card{} = card} = Cards.update_card(card, update_attrs)
      assert card.notes == "some updated notes"
    end

    test "update_card/2 with invalid data returns error changeset" do
      card = card_fixture()
      assert {:error, %Ecto.Changeset{}} = Cards.update_card(card, @invalid_attrs)
      assert card == Cards.get_card!(card.id)
    end

    test "delete_card/1 deletes the card" do
      card = card_fixture()
      assert {:ok, %Card{}} = Cards.delete_card(card)
      assert_raise Ecto.NoResultsError, fn -> Cards.get_card!(card.id) end
    end

    test "change_card/1 returns a card changeset" do
      card = card_fixture()
      assert %Ecto.Changeset{} = Cards.change_card(card)
    end
  end

  describe "card_edges" do
    alias App.Cards.Edge

    import App.CardsFixtures

    @invalid_attrs %{}

    test "list_card_edges/0 returns all card_edges" do
      edge = edge_fixture()
      assert Cards.list_card_edges() == [edge]
    end

    test "get_edge!/1 returns the edge with given id" do
      edge = edge_fixture()
      assert Cards.get_edge!(edge.id) == edge
    end

    test "create_edge/1 with valid data creates a edge" do
      valid_attrs = %{}

      assert {:ok, %Edge{} = edge} = Cards.create_edge(valid_attrs)
    end

    test "create_edge/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Cards.create_edge(@invalid_attrs)
    end

    test "update_edge/2 with valid data updates the edge" do
      edge = edge_fixture()
      update_attrs = %{}

      assert {:ok, %Edge{} = edge} = Cards.update_edge(edge, update_attrs)
    end

    test "update_edge/2 with invalid data returns error changeset" do
      edge = edge_fixture()
      assert {:error, %Ecto.Changeset{}} = Cards.update_edge(edge, @invalid_attrs)
      assert edge == Cards.get_edge!(edge.id)
    end

    test "delete_edge/1 deletes the edge" do
      edge = edge_fixture()
      assert {:ok, %Edge{}} = Cards.delete_edge(edge)
      assert_raise Ecto.NoResultsError, fn -> Cards.get_edge!(edge.id) end
    end

    test "change_edge/1 returns a edge changeset" do
      edge = edge_fixture()
      assert %Ecto.Changeset{} = Cards.change_edge(edge)
    end
  end
end
